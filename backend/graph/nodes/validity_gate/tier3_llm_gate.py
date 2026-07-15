from loguru import logger
from enums.Domain import Domain
from graph.state import FullGraphState
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate
from services.llm_manager import LLMManager

llm_manager=LLMManager()
class Tier3Response(BaseModel):
    is_legal: bool
    is_legal_confidence: float
    domain: Domain|None 
    domain_confidence:float
    needs_clarification:bool
    reasoning:str

TIER3_GATE_PROMPT = """You are a coarse intent filter for an Indian legal assistant.

Your ONLY job is to decide: does this message belong in a legal conversation?
You are NOT evaluating whether the user has provided enough information.
You are NOT deciding if clarification or retrieval is needed.
Those decisions are made by downstream nodes.

Think of yourself as a broad gate, not a legal analyst.

--- PASS if the user is: ---
- Describing any legal problem, even vaguely (fired, evicted, scammed, harassed, arrested).
- Asking about rights, obligations, remedies, compensation, contracts, notices, FIRs, court orders.
- Mentioning an employer, landlord, police, court, government authority, or consumer complaint.
- Asking "what should I do?", "is this legal?", "can they do this?", "what are my rights?".
- Providing a short follow-up answer to an earlier question in the conversation (e.g., "Yes", "No", "Karnataka", "2 years", "Poor performance", "Private company", "120 employees", "Last month").
  → Check if earlier messages suggest an ongoing legal discussion. If yes, always PASS.
- Describing a situation that COULD escalate into a legal matter, even if it hasn't yet.

Domains that qualify (any of these is enough to PASS):
employment, wages, termination, workplace, landlord, rent, eviction, deposit, police, FIR,
consumer goods/services, refund, court, property, family, divorce, maintenance, domestic violence,
cyber fraud, online harassment, tax, government, constitutional rights, criminal matter.

--- REJECT only if the message is clearly ALL of the following: ---
- Has no connection to law, rights, government, or a dispute.
- Is obviously casual conversation (greetings, jokes, recipes, sports, weather).
- Is random keyboard input, spam, or completely unintelligible.

Examples of messages to PASS:
- "I was fired" → is_legal=true, labour_employment
- "My landlord isn't returning my deposit" → is_legal=true, tenant_property
- "Police took my phone" → is_legal=true, other_legal
- "I got a notice" → is_legal=true (vague, but plausibly legal — PASS)
- "My salary wasn't paid" → is_legal=true, labour_employment
- "Karnataka" → is_legal=true (short follow-up answer in an ongoing legal conversation — PASS)
- "2 years" → is_legal=true (same as above — PASS)
- "Poor performance" → is_legal=true (same — PASS)
- "My boss is being unfair" → is_legal=true (vague but legal — downstream will clarify)
- "What should I do?" → is_legal=true

Examples of messages to REJECT:
- "What's the weather today?" → is_legal=false
- "Tell me a joke" → is_legal=false
- "How do I cook biryani?" → is_legal=false
- "asdfghjkl" → is_legal=false

WHEN IN DOUBT, PASS. It is far better to let a borderline message through than to block a genuine user in distress.

Query from user: {query}

Supported domains:
- "labour_employment": salary, termination, PF/ESI/gratuity, workplace, retrenchment
- "consumer_protection": defective goods/services, refunds, e-commerce, consumer complaints
- "tenant_property": rent, eviction, security deposit, landlord-tenant disputes
- "cyber_crime": online fraud, hacking, harassment, data/privacy breaches
- "family_womens_rights": domestic violence, maintenance, divorce, dowry, POSH, custody
- "other_legal": criminal, property, tax, constitutional, government — anything clearly legal but outside the five above

Rules:
- If is_legal is false, domain must be null and needs_clarification must be false.
- If is_legal is true but domain is unclear, set domain to "other_legal" rather than null.
- needs_clarification should almost always be false — the gate does not ask for clarification.

Respond with ONLY this JSON object, nothing else, no markdown fences, no extra keys:
{{
  "is_legal": true or false,
  "is_legal_confidence": 0.0 to 1.0,
  "domain": "labour_employment" | "consumer_protection" | "tenant_property" | "cyber_crime" | "family_womens_rights" | "other_legal" | null,
  "domain_confidence": 0.0 to 1.0,
  "needs_clarification": false,
  "reasoning": "one sentence explanation"
}}"""


async def tier3_llm_gate(state: FullGraphState):
    """
    Tier 3 LLM Gate:

    Input: user query string
    Output: {is_legal: bool, confidence: float, reasoning: str}
    """
    messages = state.get("messages") or []
    query: str = messages[-1].content if messages else ""
    logger.info(f"Tier 3 LLM gate invoked for query='{query[:80]}'")

    # Explicit provider loop — same reason as conversation_understanding.py:
    # with_fallbacks() on an async chain doesn't reliably intercept 429s.
    _providers = [
        ("groq",       llm_manager.groq),
        ("gemini",     llm_manager.gemini),
        ("mistral",    llm_manager.mistral),
        ("openrouter", llm_manager.openrouter),
    ]
    result = None
    for provider_name, model in _providers:
        try:
            prompt = ChatPromptTemplate.from_template(TIER3_GATE_PROMPT)
            parser = PydanticOutputParser(pydantic_object=Tier3Response)
            chain = prompt | model | parser
            result = await chain.ainvoke({"query": query})
            logger.info(
                f"Tier 3 result via '{provider_name}': is_legal={result.is_legal}, "
                f"confidence={result.is_legal_confidence:.2f}, reasoning='{result.reasoning}'"
            )
            break
        except Exception as e:
            logger.warning(
                f"Tier 3 provider '{provider_name}' failed ({type(e).__name__}): {e} — trying next provider"
            )

    if result is None:
        raise RuntimeError(f"Tier 3 LLM gate failed: all providers exhausted for query='{query[:80]}'")

    return result