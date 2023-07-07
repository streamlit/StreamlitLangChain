import { BaseChatModel, BaseChatModelParams } from "./base.js";
import { BaseMessage, ChatResult } from "../schema/index.js";
import { CallbackManagerForLLMRun } from "../callbacks/manager.js";
import { BaseLanguageModelCallOptions } from "../base_language/index.js";
export type WenxinMessageRole = "assistant" | "user";
interface WenxinMessage {
    role: WenxinMessageRole;
    content: string;
}
interface ChatCompletionRequest {
    messages: WenxinMessage[];
    stream?: boolean;
    user_id?: string;
    temperature?: number;
    top_p?: number;
    penalty_score?: number;
}
declare interface BaiduWenxinChatInput {
    /** Model name to use
     * @default "ERNIE-Bot-turbo"
     */
    modelName: string;
    /** Whether to stream the results or not. Defaults to false. */
    streaming?: boolean;
    /** Messages to pass as a prefix to the prompt */
    prefixMessages?: WenxinMessage[];
    /**
     * ID of the end-user who made requests.
     */
    userId?: string;
    /**
     * API key to use when making requests. Defaults to the value of
     * `BAIDU_API_KEY` environment variable.
     */
    baiduApiKey?: string;
    /**
     * Secret key to use when making requests. Defaults to the value of
     * `BAIDU_SECRET_KEY` environment variable.
     */
    baiduSecretKey?: string;
    /** Amount of randomness injected into the response. Ranges
     * from 0 to 1 (0 is not included). Use temp closer to 0 for analytical /
     * multiple choice, and temp closer to 1 for creative
     * and generative tasks. Defaults to 0.95.
     * Only supported for `modelName` of `WenxinModelName.ERNIE_BOT`.
     */
    temperature?: number;
    /** Total probability mass of tokens to consider at each step. Range
     * from 0 to 1.0. Defaults to 0.8.
     * Only supported for `modelName` of `WenxinModelName.ERNIE_BOT`.
     */
    topP?: number;
    /** Penalizes repeated tokens according to frequency. Range
     * from 1.0 to 2.0. Defaults to 1.0.
     * Only supported for `modelName` of `WenxinModelName.ERNIE_BOT`.
     */
    penaltyScore?: number;
}
/**
 * Wrapper around Baidu ERNIE large language models that use the Chat endpoint.
 *
 * To use you should have the `BAIDU_API_KEY` and `BAIDU_SECRET_KEY`
 * environment variable set.
 *
 * @augments BaseLLM
 * @augments BaiduERNIEInput
 */
export declare class ChatBaiduWenxin extends BaseChatModel implements BaiduWenxinChatInput {
    CallOptions: BaseLanguageModelCallOptions;
    get callKeys(): string[];
    get lc_secrets(): {
        [key: string]: string;
    } | undefined;
    get lc_aliases(): {
        [key: string]: string;
    } | undefined;
    lc_serializable: boolean;
    baiduApiKey?: string;
    baiduSecretKey?: string;
    accessToken: string;
    streaming: boolean;
    prefixMessages?: WenxinMessage[];
    userId?: string;
    modelName: string;
    apiUrl: string;
    temperature?: number | undefined;
    topP?: number | undefined;
    penaltyScore?: number | undefined;
    constructor(fields?: Partial<BaiduWenxinChatInput> & BaseChatModelParams);
    getAccessToken(options?: this["ParsedCallOptions"]): Promise<any>;
    /**
     * Get the parameters used to invoke the model
     */
    invocationParams(): Omit<ChatCompletionRequest, "messages">;
    /**
     * Get the identifying parameters for the model
     */
    identifyingParams(): {
        stream?: boolean | undefined;
        temperature?: number | undefined;
        top_p?: number | undefined;
        user_id?: string | undefined;
        penalty_score?: number | undefined;
        model_name: string;
    };
    /** @ignore */
    _generate(messages: BaseMessage[], options?: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): Promise<ChatResult>;
    /** @ignore */
    completionWithRetry(request: ChatCompletionRequest, stream: boolean, signal?: AbortSignal, onmessage?: (event: MessageEvent) => void): Promise<any>;
    _llmType(): string;
    /** @ignore */
    _combineLLMOutput(): never[];
}
export {};
