export type DocumentType =
    | "act"
    | "rule"
    | "notification"
    | "scheme"
    | "guidance"

export type BaseMessage = {
    type: "human" | "ai" | "system" | "tool" | string
    content: string
    additional_kwargs?: Record<string, unknown>
    response_metadata?: Record<string, unknown>
}

export type RetrievedChunk = {
    [key: string]: unknown
}

export type FullGraphState = {
    // Context
    conversation_id?: string
    messages?: BaseMessage[]

    // Conversation Context
    working_memory?: string
    normalized_query?: string
    jurisdiction?: string[] | null
    employment_type?: string | null
    document_type?: DocumentType | null
    domain?: string

    // Validity
    validity?: string | null

    // Decision Node
    next_action?: string
    clarification_questions?: string[]
    refined_query?: string
    final_answer?: string
    clarification_count?: number

    // Retrieval
    retrieved_chunks?: RetrievedChunk[]
    retrieval_status?: string
    retrieval_count?: number

    // Tool outputs
    tool_results?: Record<string, unknown>

    // Final answer
    response?: string | null
}