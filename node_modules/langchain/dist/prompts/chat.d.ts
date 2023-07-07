import { BaseMessage, BasePromptValue, InputValues, PartialValues } from "../schema/index.js";
import { Serializable } from "../load/serializable.js";
import { BasePromptTemplate, BasePromptTemplateInput, BaseStringPromptTemplate } from "./base.js";
export declare abstract class BaseMessagePromptTemplate extends Serializable {
    lc_namespace: string[];
    lc_serializable: boolean;
    abstract inputVariables: string[];
    abstract formatMessages(values: InputValues): Promise<BaseMessage[]>;
}
export interface ChatPromptValueFields {
    messages: BaseMessage[];
}
export declare class ChatPromptValue extends BasePromptValue {
    lc_namespace: string[];
    lc_serializable: boolean;
    messages: BaseMessage[];
    constructor(messages: BaseMessage[]);
    constructor(fields: ChatPromptValueFields);
    toString(): string;
    toChatMessages(): BaseMessage[];
}
export interface MessagePlaceholderFields {
    variableName: string;
}
export declare class MessagesPlaceholder extends BaseMessagePromptTemplate {
    variableName: string;
    constructor(variableName: string);
    constructor(fields: MessagePlaceholderFields);
    get inputVariables(): string[];
    formatMessages(values: InputValues): Promise<BaseMessage[]>;
}
export interface MessageStringPromptTemplateFields {
    prompt: BaseStringPromptTemplate;
}
export declare abstract class BaseMessageStringPromptTemplate extends BaseMessagePromptTemplate {
    prompt: BaseStringPromptTemplate;
    constructor(prompt: BaseStringPromptTemplate);
    constructor(fields: MessageStringPromptTemplateFields);
    get inputVariables(): string[];
    abstract format(values: InputValues): Promise<BaseMessage>;
    formatMessages(values: InputValues): Promise<BaseMessage[]>;
}
export declare abstract class BaseChatPromptTemplate extends BasePromptTemplate {
    PromptValueReturnType: ChatPromptValue;
    constructor(input: BasePromptTemplateInput);
    abstract formatMessages(values: InputValues): Promise<BaseMessage[]>;
    format(values: InputValues): Promise<string>;
    formatPromptValue(values: InputValues): Promise<ChatPromptValue>;
}
export interface ChatMessagePromptTemplateFields extends MessageStringPromptTemplateFields {
    role: string;
}
export declare class ChatMessagePromptTemplate extends BaseMessageStringPromptTemplate {
    role: string;
    format(values: InputValues): Promise<BaseMessage>;
    constructor(prompt: BaseStringPromptTemplate, role: string);
    constructor(fields: ChatMessagePromptTemplateFields);
    static fromTemplate(template: string, role: string): ChatMessagePromptTemplate;
}
export declare class HumanMessagePromptTemplate extends BaseMessageStringPromptTemplate {
    format(values: InputValues): Promise<BaseMessage>;
    static fromTemplate(template: string): HumanMessagePromptTemplate;
}
export declare class AIMessagePromptTemplate extends BaseMessageStringPromptTemplate {
    format(values: InputValues): Promise<BaseMessage>;
    static fromTemplate(template: string): AIMessagePromptTemplate;
}
export declare class SystemMessagePromptTemplate extends BaseMessageStringPromptTemplate {
    format(values: InputValues): Promise<BaseMessage>;
    static fromTemplate(template: string): SystemMessagePromptTemplate;
}
export interface ChatPromptTemplateInput extends BasePromptTemplateInput {
    /**
     * The prompt messages
     */
    promptMessages: BaseMessagePromptTemplate[];
    /**
     * Whether to try validating the template on initialization
     *
     * @defaultValue `true`
     */
    validateTemplate?: boolean;
}
export declare class ChatPromptTemplate extends BaseChatPromptTemplate implements ChatPromptTemplateInput {
    get lc_aliases(): {
        promptMessages: string;
    };
    promptMessages: BaseMessagePromptTemplate[];
    validateTemplate: boolean;
    constructor(input: ChatPromptTemplateInput);
    _getPromptType(): "chat";
    formatMessages(values: InputValues): Promise<BaseMessage[]>;
    partial(values: PartialValues): Promise<ChatPromptTemplate>;
    static fromPromptMessages(promptMessages: (BaseMessagePromptTemplate | ChatPromptTemplate)[]): ChatPromptTemplate;
}
