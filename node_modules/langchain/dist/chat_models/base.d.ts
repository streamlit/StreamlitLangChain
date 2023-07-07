import { BaseMessage, BasePromptValue, ChatResult, LLMResult } from "../schema/index.js";
import { BaseLanguageModel, BaseLanguageModelCallOptions, BaseLanguageModelParams } from "../base_language/index.js";
import { CallbackManagerForLLMRun, Callbacks } from "../callbacks/manager.js";
export type SerializedChatModel = {
    _model: string;
    _type: string;
} & Record<string, any>;
export type SerializedLLM = {
    _model: string;
    _type: string;
} & Record<string, any>;
export type BaseChatModelParams = BaseLanguageModelParams;
export type BaseChatModelCallOptions = BaseLanguageModelCallOptions;
export declare abstract class BaseChatModel extends BaseLanguageModel {
    CallOptions: BaseChatModelCallOptions;
    ParsedCallOptions: Omit<this["CallOptions"], "timeout" | "tags" | "metadata" | "callbacks">;
    lc_namespace: string[];
    constructor(fields: BaseChatModelParams);
    abstract _combineLLMOutput?(...llmOutputs: LLMResult["llmOutput"][]): LLMResult["llmOutput"];
    generate(messages: BaseMessage[][], options?: string[] | this["CallOptions"], callbacks?: Callbacks): Promise<LLMResult>;
    /**
     * Get the parameters used to invoke the model
     */
    invocationParams(_options?: this["ParsedCallOptions"]): any;
    _modelType(): string;
    abstract _llmType(): string;
    generatePrompt(promptValues: BasePromptValue[], options?: string[] | this["CallOptions"], callbacks?: Callbacks): Promise<LLMResult>;
    abstract _generate(messages: BaseMessage[], options: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): Promise<ChatResult>;
    call(messages: BaseMessage[], options?: string[] | this["CallOptions"], callbacks?: Callbacks): Promise<BaseMessage>;
    callPrompt(promptValue: BasePromptValue, options?: string[] | this["CallOptions"], callbacks?: Callbacks): Promise<BaseMessage>;
    predictMessages(messages: BaseMessage[], options?: string[] | this["CallOptions"], callbacks?: Callbacks): Promise<BaseMessage>;
    predict(text: string, options?: string[] | this["CallOptions"], callbacks?: Callbacks): Promise<string>;
}
export declare abstract class SimpleChatModel extends BaseChatModel {
    abstract _call(messages: BaseMessage[], options: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): Promise<string>;
    _generate(messages: BaseMessage[], options: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): Promise<ChatResult>;
}
