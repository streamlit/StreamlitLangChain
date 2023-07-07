import { ChatCompletionRequestMessageFunctionCall } from "openai";
import { Document } from "../document.js";
import { Serializable } from "../load/serializable.js";
export declare const RUN_KEY = "__run";
export type Example = Record<string, string>;
export type InputValues = Record<string, any>;
export type PartialValues = Record<string, string | (() => Promise<string>) | (() => string)>;
/**
 * Output of a single generation.
 */
export interface Generation {
    /**
     * Generated text output
     */
    text: string;
    /**
     * Raw generation info response from the provider.
     * May include things like reason for finishing (e.g. in {@link OpenAI})
     */
    generationInfo?: Record<string, any>;
}
/**
 * Contains all relevant information returned by an LLM.
 */
export type LLMResult = {
    /**
     * List of the things generated. Each input could have multiple {@link Generation | generations}, hence this is a list of lists.
     */
    generations: Generation[][];
    /**
     * Dictionary of arbitrary LLM-provider specific output.
     */
    llmOutput?: Record<string, any>;
    /**
     * Dictionary of run metadata
     */
    [RUN_KEY]?: Record<string, any>;
};
export interface StoredMessageData {
    content: string;
    role: string | undefined;
    name: string | undefined;
    additional_kwargs?: Record<string, any>;
}
export interface StoredMessage {
    type: string;
    data: StoredMessageData;
}
export type MessageType = "human" | "ai" | "generic" | "system" | "function";
export interface BaseMessageFields {
    content: string;
    name?: string;
    additional_kwargs?: {
        function_call?: ChatCompletionRequestMessageFunctionCall;
        [key: string]: unknown;
    };
}
export interface ChatMessageFieldsWithRole extends BaseMessageFields {
    role: string;
}
export declare abstract class BaseMessage extends Serializable implements BaseMessageFields {
    lc_namespace: string[];
    lc_serializable: boolean;
    /**
     * @deprecated
     * Use {@link BaseMessage.content} instead.
     */
    get text(): string;
    /** The text of the message. */
    content: string;
    /** The name of the message sender in a multi-user chat. */
    name?: string;
    /** Additional keyword arguments */
    additional_kwargs: NonNullable<BaseMessageFields["additional_kwargs"]>;
    /** The type of the message. */
    abstract _getType(): MessageType;
    constructor(fields: string | BaseMessageFields, 
    /** @deprecated */
    kwargs?: Record<string, unknown>);
    toDict(): StoredMessage;
}
export declare class HumanMessage extends BaseMessage {
    _getType(): MessageType;
}
export declare class AIMessage extends BaseMessage {
    _getType(): MessageType;
}
export declare class SystemMessage extends BaseMessage {
    _getType(): MessageType;
}
/**
 * @deprecated
 * Use {@link BaseMessage} instead.
 */
export declare const BaseChatMessage: typeof BaseMessage;
/**
 * @deprecated
 * Use {@link HumanMessage} instead.
 */
export declare const HumanChatMessage: typeof HumanMessage;
/**
 * @deprecated
 * Use {@link AIMessage} instead.
 */
export declare const AIChatMessage: typeof AIMessage;
/**
 * @deprecated
 * Use {@link SystemMessage} instead.
 */
export declare const SystemChatMessage: typeof SystemMessage;
export declare class FunctionMessage extends BaseMessage {
    constructor(fields: string | BaseMessageFields, 
    /** @deprecated */
    name: string);
    _getType(): MessageType;
}
export declare class ChatMessage extends BaseMessage implements ChatMessageFieldsWithRole {
    role: string;
    constructor(content: string, role: string);
    constructor(fields: ChatMessageFieldsWithRole);
    _getType(): MessageType;
}
export interface ChatGeneration extends Generation {
    message: BaseMessage;
}
export interface ChatResult {
    generations: ChatGeneration[];
    llmOutput?: Record<string, any>;
}
/**
 * Base PromptValue class. All prompt values should extend this class.
 */
export declare abstract class BasePromptValue extends Serializable {
    abstract toString(): string;
    abstract toChatMessages(): BaseMessage[];
}
export type AgentAction = {
    tool: string;
    toolInput: string;
    log: string;
};
export type AgentFinish = {
    returnValues: Record<string, any>;
    log: string;
};
export type AgentStep = {
    action: AgentAction;
    observation: string;
};
export type ChainValues = Record<string, any>;
/**
 * Base Index class. All indexes should extend this class.
 */
export declare abstract class BaseRetriever {
    abstract getRelevantDocuments(query: string): Promise<Document[]>;
}
export declare abstract class BaseChatMessageHistory extends Serializable {
    abstract getMessages(): Promise<BaseMessage[]>;
    abstract addUserMessage(message: string): Promise<void>;
    abstract addAIChatMessage(message: string): Promise<void>;
    abstract clear(): Promise<void>;
}
export declare abstract class BaseListChatMessageHistory extends Serializable {
    protected abstract addMessage(message: BaseMessage): Promise<void>;
    addUserMessage(message: string): Promise<void>;
    addAIChatMessage(message: string): Promise<void>;
}
export declare abstract class BaseCache<T = Generation[]> {
    abstract lookup(prompt: string, llmKey: string): Promise<T | null>;
    abstract update(prompt: string, llmKey: string, value: T): Promise<void>;
}
export declare abstract class BaseFileStore extends Serializable {
    abstract readFile(path: string): Promise<string>;
    abstract writeFile(path: string, contents: string): Promise<void>;
}
export declare abstract class BaseEntityStore extends Serializable {
    abstract get(key: string, defaultValue?: string): Promise<string | undefined>;
    abstract set(key: string, value?: string): Promise<void>;
    abstract delete(key: string): Promise<void>;
    abstract exists(key: string): Promise<boolean>;
    abstract clear(): Promise<void>;
}
export declare abstract class Docstore {
    abstract search(search: string): Promise<Document>;
    abstract add(texts: Record<string, Document>): Promise<void>;
}
