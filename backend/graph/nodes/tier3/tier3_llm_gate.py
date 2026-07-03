import json
from typing import Literal, Optional
from loguru import logger
from graph.enum.Domain import Domain
from graph.state import FullGraphState
from graph.nodes.validity_gate.rules import GateResult
from core.config import setting
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_mistralai import ChatMistralAI
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate


class Tier3Response(BaseModel):
    is_legal: bool
    is_legal_confidence: float
    domain: Domain|None 
    domain_confidence:float
    needs_clarification:bool
    reasoning:str

TIER3_GATE_PROMPT = """You are a legal query validator and domain classifier for an Indian legal assistant.

Your job has two parts:
1. Decide if the user's query is asking about LEGAL RIGHTS, LEGAL PROCEDURES, or LEGAL GUIDANCE (under Indian law).
2. If it is legal, classify it into exactly ONE of the supported domains below. If it doesn't clearly fit any, or you need more information to tell, say so — do not force-fit it.

Supported domains:
- "labour_employment": salary/wage disputes, termination, retrenchment, PF/ESI/gratuity, workplace conditions, contracts of employment
- "consumer_protection": defective goods/services, refunds, e-commerce disputes, deficiency in service, consumer complaints
- "tenant_property": rent, eviction, security deposit, landlord-tenant disputes, property possession
- "cyber_crime": online fraud, hacking, harassment online, data/privacy breaches, digital scams
- "family_womens_rights": domestic violence, maintenance, divorce, dowry, workplace harassment (POSH), custody
- "other_legal": clearly a legal question but outside the five domains above (e.g. criminal law, inheritance, taxation, contracts unrelated to employment)

Query from user: {query}

Examples of LEGAL queries:
- "My employer hasn't paid my salary" -> labour_employment
- "Can my landlord evict me without notice?" -> tenant_property
- "How do I file a consumer complaint?" -> consumer_protection
- "What are my rights if I'm wrongly accused online?" -> cyber_crime
- "My husband hasn't paid maintenance in months" -> family_womens_rights
- "Someone is threatening to leak my photos" -> cyber_crime
- "My boss is being unfair to me" -> labour_employment, but needs_clarification=true (too vague to act on)

Examples of NON-LEGAL queries:
- "What's the weather today?"
- "Tell me a joke"
- "How do I cook biryani?"
- "Who won the cricket match?"

Rules:
- If is_legal is false, domain must be null and needs_clarification must be false.
- If the query is legal but doesn't fit any of the five supported domains, set domain to "other_legal".
- If the query is legal and domain is genuinely ambiguous between two supported domains, or too vague to classify, set needs_clarification to true and pick your best-guess domain anyway (do not set domain to null when is_legal is true).
- confidence for "is_legal" reflects certainty it's a legal query at all.
- confidence for "domain" reflects certainty in the specific domain choice, independent of is_legal confidence.

Respond with ONLY this JSON format, nothing else, no markdown fences:
{{
  "is_legal": true or false,
  "is_legal_confidence": 0.0 to 1.0,
  "domain": "labour_employment" | "consumer_protection" | "tenant_property" | "cyber_crime" | "family_womens_rights" | "other_legal" | null,
  "domain_confidence": 0.0 to 1.0,
  "needs_clarification": true or false,
  "reasoning": "one sentence explanation covering both the legality and domain decision"
}}"""


async def tier3_llm_gate(state: FullGraphState):
    """
    Tier 3 LLM Gate:

    Input: user query string
    Output: {is_legal: bool, confidence: float, reasoning: str}
    """
    query = state["query"]  # type: ignore
    logger.info(f"Tier 3 LLM gate invoked for query='{query[:80]}'")

    try:
        groq = ChatGroq(
            model="llama-3.3-70b-versatile",
            api_key=setting.GROQ_API_KEY,
            temperature=0, max_retries=2, max_tokens=200,
        )
        gemini = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=setting.GOOGLE_API_KEY,
            temperature=0, max_retries=2, max_tokens=200,
        )
        mistral = ChatMistralAI(
            model_name="mistral-small-latest",
            api_key=setting.MISTRAL_API_KEY,
            temperature=0, max_retries=2, max_tokens=200,
        )
        openrouter = ChatOpenAI(
            model="deepseek/deepseek-r1-0528:free",
            api_key=setting.OPENAI_API_KEY,
            base_url="https://openrouter.ai/api/v1",
            temperature=0, max_retries=2,
        )

        llm = groq.with_fallbacks([gemini, mistral, openrouter])
        prompt = ChatPromptTemplate.from_template(TIER3_GATE_PROMPT)
        parser = PydanticOutputParser(pydantic_object=Tier3Response)
        chain = prompt | llm | parser

        result = await chain.ainvoke({"query": query})
        logger.info(
            f"Tier 3 result: is_legal={result.is_legal}, "
            f"confidence={result.confidence:.2f}, reasoning='{result.reasoning}'"
        )
        return result

    except Exception as e:
        logger.exception(f"Tier 3 LLM gate failed for query='{query[:80]}': {e}")
        raise RuntimeError(f"Tier 3 LLM gate failed: {e}") from e