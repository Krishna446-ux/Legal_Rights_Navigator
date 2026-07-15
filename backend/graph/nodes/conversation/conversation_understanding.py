import asyncio

from loguru import logger
from enums.RetrievalStatus import RetrievalStatus
from enums.Domain import Domain
from graph.nodes.retrieve.retrieve import retrieve
from langchain_core.messages import HumanMessage

from enums.AgentAction import AgentAction
from graph.node_types.conversation_model import ConversationDecision
from graph.state import FullGraphState
from services.llm_manager import LLMManager
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import AIMessage

max_clarification_count=3
SYSTEM_PROMPT = """
You are an expert Indian labour-law assistant.

Your task is to decide the next best action for the user's legal question. 
To do this effectively, you must follow a strict step-by-step evaluation process:

STEP 1: Analyze the Context
- Review the recent conversation messages to understand the user's core issue and intent.
- Check the 'Working memory' to recall established facts about the user's situation.
- Read the 'Retrieved legal evidence' carefully. Does it directly address the user's query?

STEP 2: Evaluate Information Sufficiency
- Are there critical real-world facts missing (e.g., employment type, dates, reasons given by employer) that are necessary to apply the law?
- Is the retrieved evidence relevant and sufficient to provide a grounded, legally accurate answer?

STEP 3: Decide Next Action
Based on your analysis, choose exactly ONE of the following actions:
- ask_clarification: Choose this when essential user facts are missing. Ask only about real-world facts (e.g., "When were you terminated?"), NEVER ask the user about laws or legal requirements.
- retrieve: Choose this when you need more specific legal evidence to answer the query, AND retrieval has been attempted less than 2 times. Put the improved search query in `refined_query`.
- answer: Choose this when the retrieved evidence is sufficient to answer the query, OR if retrieval has already been attempted 2 times. Put the complete user-facing answer in `answer`.

Rules for Answering & Memory:
- Always base your legal claims strictly on the retrieved evidence. Do not invent laws, sections, rights, or facts.
- Treat 'Working memory' as the source of truth. Update it ONLY with new stable facts explicitly stated by the user. Preserve existing facts unless corrected by the user.
- Never ask for information that already exists in the working memory.

Clarification Policy

Your goal is to collect only the minimum information required to provide a legally grounded answer.

Rules:
1. Ask at most {max_clarification_count} clarification rounds.
2. In each round, ask no more than 3 questions.
3. If enough information has been collected to identify the applicable area of law, choose `retrieve` instead of asking more questions.
4. Do not ask questions that are merely helpful or nice to know. Ask only for facts that are essential.
5. If the user says they do not know, do not repeat or rephrase the same question. Accept that the information is unavailable and continue with the available facts.
6. If the user cannot provide an essential fact, make that limitation explicit in your final answer instead of continuing to ask.
7. If the user has already answered a question, never ask it again.
8. If clarification has already been attempted {max_clarification_count}, do not ask further clarification questions. Choose `retrieve` or `answer` based on the available information.
"""
CONVERSATION_PROMPT = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_PROMPT),

        # Real HumanMessage/AIMessage objects from your state.
        #Previous Conversatiom 
        MessagesPlaceholder(variable_name="recent_messages"),

        (
            "human",
            """
Current normalized query:
{normalized_query}

Working memory:
{working_memory}

Retrieval status:
{retrieval_status}

Retrieval attempt:
{retrieval_count}

Retrieved legal evidence:
{retrieved_evidence}

clarification_round:
{clarification_count}
""",
        ),
    ]
)


llm = LLMManager()


async def conversation_understanding(state: FullGraphState):
    query = state.get("normalized_query", "")
    logger.info(f"conversation_understanding invoked for query='{query[:80]}'")

    chunks = state.get("retrieved_chunks", [])
    retrieved_evidence = "\n\n".join(
        f"[Evidence {index}]\n{chunk.text}"
        for index, chunk in enumerate(chunks, start=1)
    )
    input_data = {
        "recent_messages": state.get("messages", [])[-5:],
        "normalized_query": query,
        "working_memory": state.get("working_memory", ""),
        "retrieval_status": str(state.get("retrieval_status", "")),
        "retrieval_count": state.get("retrieval_count", 0),
        "retrieved_evidence": retrieved_evidence,
        "clarification_count": state.get("clarification_count", 0),
        "max_clarification_count":max_clarification_count,
    }

    # Ordered list of providers. Each is tried in turn; the first to succeed is used.
    # We do NOT use .with_fallbacks() on a with_structured_output() chain because
    # with_structured_output() returns a RunnableSequence, and with_fallbacks() wraps
    # it at the wrong level — the 429 from Gemini propagates past the fallback boundary.
    # An explicit loop is unambiguous and works regardless of LangChain internals.
    _providers = [
        ("gemini",     llm.gemini),
        ("groq",       llm.groq),
        ("mistral",    llm.mistral),
        ("openrouter", llm.openrouter),
    ]
    response = None
    for provider_name, model in _providers:
        try:
            chain = CONVERSATION_PROMPT | model.with_structured_output(ConversationDecision)
            response = await chain.ainvoke(input_data)
            logger.info(f"LLM decision via '{provider_name}': action={response.action}")
            break
        except Exception as e:
            logger.warning(
                f"Provider '{provider_name}' failed ({type(e).__name__}): {e} — trying next provider"
            )

    if response is None:
        logger.error("All LLM providers failed for conversation_understanding")
        return {
            "messages": [AIMessage(content="I'm having trouble processing your request right now. Please try again.")]
        }
    old_memory = state.get("working_memory", "")
    new_memory = response.updated_working_memory or ""
    update = {
        "next_action": response.action,
        "final_answer": response.answer,
        "refined_query": response.refined_query,
        "working_memory": "\n".join(memory for memory in [old_memory, new_memory]if memory),
        "clarification_questions": response.clarification_questions,
    }
    if response.action == AgentAction.RETRIEVE:
        # Bug 2 fix: update dict doesn't have retrieval_count yet — must read from state
        update["retrieval_count"] = state.get("retrieval_count", 0) + 1
        
    elif response.action == AgentAction.ASK_CLARIFICATION:
        questions = "\n".join(
            f"- {question}"
            for question in response.clarification_questions
        )
        update["messages"] = [
            AIMessage(content=f"I need a few details:\n{questions}")
        ]
        update["clarification_count"]=state.get("clarification_count",0)+1

    else:
        update["messages"] = [
            AIMessage(
                content=response.answer
                or "I could not form a grounded answer."
            )
        ]

    return update

async def main():
    state: FullGraphState = {
        "conversation_id": "test-001",
        "messages": [
            HumanMessage(
                content="Can a permanent employee be terminated without notice?"
            )
        ],
        "working_memory": (
            "User works in Karnataka and is a permanent employee."
        ),
        "normalized_query": (
            "Can a permanent employee be terminated without notice?"
        ),
        "jurisdiction": ["central", "karnataka"],
        "employment_type": "permanent",
        "document_type": None,
        "domain": Domain.LABOUR,
        "retrieval_count": 0,
        "max_retrieve": 2,
    }

    # retrieve(state) returns a dictionary; merge it into state.
    state = {
        **state,
        **(await retrieve(state)),
    }

    if state.get("retrieval_status") == RetrievalStatus.ERROR:
        print("Retrieval failed.")
        return

    result = conversation_understanding(state)

    print("Action:", result["next_action"])
    print("Answer:", result["final_answer"])
    print("Refined query:", result["refined_query"])
    print("Questions:", result["clarification_questions"])

    for message in result.get("messages", []):
        print("\nAI message:")
        print(message.content)


if __name__ == "__main__":
    asyncio.run(main())