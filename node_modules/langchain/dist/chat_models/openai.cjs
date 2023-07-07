"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptLayerChatOpenAI = exports.ChatOpenAI = void 0;
const openai_1 = require("openai");
const env_js_1 = require("../util/env.cjs");
const axios_fetch_adapter_js_1 = __importDefault(require("../util/axios-fetch-adapter.cjs"));
const base_js_1 = require("./base.cjs");
const index_js_1 = require("../schema/index.cjs");
const count_tokens_js_1 = require("../base_language/count_tokens.cjs");
const prompt_layer_js_1 = require("../util/prompt-layer.cjs");
const convert_to_openai_js_1 = require("../tools/convert_to_openai.cjs");
const azure_js_1 = require("../util/azure.cjs");
function messageTypeToOpenAIRole(type) {
    switch (type) {
        case "system":
            return "system";
        case "ai":
            return "assistant";
        case "human":
            return "user";
        case "function":
            return "function";
        default:
            throw new Error(`Unknown message type: ${type}`);
    }
}
function openAIResponseToChatMessage(message) {
    switch (message.role) {
        case "user":
            return new index_js_1.HumanMessage(message.content || "");
        case "assistant":
            return new index_js_1.AIMessage(message.content || "", {
                function_call: message.function_call,
            });
        case "system":
            return new index_js_1.SystemMessage(message.content || "");
        default:
            return new index_js_1.ChatMessage(message.content || "", message.role ?? "unknown");
    }
}
/**
 * Wrapper around OpenAI large language models that use the Chat endpoint.
 *
 * To use you should have the `openai` package installed, with the
 * `OPENAI_API_KEY` environment variable set.
 *
 * To use with Azure you should have the `openai` package installed, with the
 * `AZURE_OPENAI_API_KEY`,
 * `AZURE_OPENAI_API_INSTANCE_NAME`,
 * `AZURE_OPENAI_API_DEPLOYMENT_NAME`
 * and `AZURE_OPENAI_API_VERSION` environment variable set.
 * `AZURE_OPENAI_BASE_PATH` is optional and will override `AZURE_OPENAI_API_INSTANCE_NAME` if you need to use a custom endpoint.
 *
 * @remarks
 * Any parameters that are valid to be passed to {@link
 * https://platform.openai.com/docs/api-reference/chat/create |
 * `openai.createCompletion`} can be passed through {@link modelKwargs}, even
 * if not explicitly available on this class.
 */
class ChatOpenAI extends base_js_1.BaseChatModel {
    get callKeys() {
        return [
            ...super.callKeys,
            "options",
            "function_call",
            "functions",
            "tools",
            "promptIndex",
        ];
    }
    get lc_secrets() {
        return {
            openAIApiKey: "OPENAI_API_KEY",
            azureOpenAIApiKey: "AZURE_OPENAI_API_KEY",
        };
    }
    get lc_aliases() {
        return {
            modelName: "model",
            openAIApiKey: "openai_api_key",
            azureOpenAIApiVersion: "azure_openai_api_version",
            azureOpenAIApiKey: "azure_openai_api_key",
            azureOpenAIApiInstanceName: "azure_openai_api_instance_name",
            azureOpenAIApiDeploymentName: "azure_openai_api_deployment_name",
        };
    }
    constructor(fields, 
    /** @deprecated */
    configuration) {
        super(fields ?? {});
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "temperature", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "topP", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "frequencyPenalty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "presencePenalty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "n", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "logitBias", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "modelName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "gpt-3.5-turbo"
        });
        Object.defineProperty(this, "modelKwargs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "stop", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "streaming", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "maxTokens", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "openAIApiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "azureOpenAIApiVersion", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "azureOpenAIApiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "azureOpenAIApiInstanceName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "azureOpenAIApiDeploymentName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "azureOpenAIBasePath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "clientConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.openAIApiKey =
            fields?.openAIApiKey ?? (0, env_js_1.getEnvironmentVariable)("OPENAI_API_KEY");
        this.azureOpenAIApiKey =
            fields?.azureOpenAIApiKey ??
                (0, env_js_1.getEnvironmentVariable)("AZURE_OPENAI_API_KEY");
        if (!this.azureOpenAIApiKey && !this.openAIApiKey) {
            throw new Error("OpenAI or Azure OpenAI API key not found");
        }
        this.azureOpenAIApiInstanceName =
            fields?.azureOpenAIApiInstanceName ??
                (0, env_js_1.getEnvironmentVariable)("AZURE_OPENAI_API_INSTANCE_NAME");
        this.azureOpenAIApiDeploymentName =
            fields?.azureOpenAIApiDeploymentName ??
                (0, env_js_1.getEnvironmentVariable)("AZURE_OPENAI_API_DEPLOYMENT_NAME");
        this.azureOpenAIApiVersion =
            fields?.azureOpenAIApiVersion ??
                (0, env_js_1.getEnvironmentVariable)("AZURE_OPENAI_API_VERSION");
        this.azureOpenAIBasePath =
            fields?.azureOpenAIBasePath ??
                (0, env_js_1.getEnvironmentVariable)("AZURE_OPENAI_BASE_PATH");
        this.modelName = fields?.modelName ?? this.modelName;
        this.modelKwargs = fields?.modelKwargs ?? {};
        this.timeout = fields?.timeout;
        this.temperature = fields?.temperature ?? this.temperature;
        this.topP = fields?.topP ?? this.topP;
        this.frequencyPenalty = fields?.frequencyPenalty ?? this.frequencyPenalty;
        this.presencePenalty = fields?.presencePenalty ?? this.presencePenalty;
        this.maxTokens = fields?.maxTokens;
        this.n = fields?.n ?? this.n;
        this.logitBias = fields?.logitBias;
        this.stop = fields?.stop;
        this.streaming = fields?.streaming ?? false;
        if (this.azureOpenAIApiKey) {
            if (!this.azureOpenAIApiInstanceName) {
                throw new Error("Azure OpenAI API instance name not found");
            }
            if (!this.azureOpenAIApiDeploymentName) {
                throw new Error("Azure OpenAI API deployment name not found");
            }
            if (!this.azureOpenAIApiVersion) {
                throw new Error("Azure OpenAI API version not found");
            }
        }
        this.clientConfig = {
            apiKey: this.openAIApiKey,
            ...configuration,
            ...fields?.configuration,
        };
    }
    /**
     * Get the parameters used to invoke the model
     */
    invocationParams(options) {
        return {
            model: this.modelName,
            temperature: this.temperature,
            top_p: this.topP,
            frequency_penalty: this.frequencyPenalty,
            presence_penalty: this.presencePenalty,
            max_tokens: this.maxTokens === -1 ? undefined : this.maxTokens,
            n: this.n,
            logit_bias: this.logitBias,
            stop: options?.stop ?? this.stop,
            stream: this.streaming,
            functions: options?.functions ??
                (options?.tools
                    ? options?.tools.map(convert_to_openai_js_1.formatToOpenAIFunction)
                    : undefined),
            function_call: options?.function_call,
            ...this.modelKwargs,
        };
    }
    /** @ignore */
    _identifyingParams() {
        return {
            model_name: this.modelName,
            ...this.invocationParams(),
            ...this.clientConfig,
        };
    }
    /**
     * Get the identifying parameters for the model
     */
    identifyingParams() {
        return this._identifyingParams();
    }
    /** @ignore */
    async _generate(messages, options, runManager) {
        const tokenUsage = {};
        const params = this.invocationParams(options);
        const messagesMapped = messages.map((message) => ({
            role: messageTypeToOpenAIRole(message._getType()),
            content: message.content,
            name: message.name,
            function_call: message.additional_kwargs
                .function_call,
        }));
        const data = params.stream
            ? await new Promise((resolve, reject) => {
                let response;
                let rejected = false;
                let resolved = false;
                this.completionWithRetry({
                    ...params,
                    messages: messagesMapped,
                }, {
                    signal: options?.signal,
                    ...options?.options,
                    adapter: axios_fetch_adapter_js_1.default,
                    responseType: "stream",
                    onmessage: (event) => {
                        if (event.data?.trim?.() === "[DONE]") {
                            if (resolved || rejected) {
                                return;
                            }
                            resolved = true;
                            resolve(response);
                        }
                        else {
                            const data = JSON.parse(event.data);
                            if (data?.error) {
                                if (rejected) {
                                    return;
                                }
                                rejected = true;
                                reject(data.error);
                                return;
                            }
                            const message = data;
                            // on the first message set the response properties
                            if (!response) {
                                response = {
                                    id: message.id,
                                    object: message.object,
                                    created: message.created,
                                    model: message.model,
                                    choices: [],
                                };
                            }
                            // on all messages, update choice
                            for (const part of message.choices ?? []) {
                                if (part != null) {
                                    let choice = response.choices.find((c) => c.index === part.index);
                                    if (!choice) {
                                        choice = {
                                            index: part.index,
                                            finish_reason: part.finish_reason ?? undefined,
                                        };
                                        response.choices[part.index] = choice;
                                    }
                                    if (!choice.message) {
                                        choice.message = {
                                            role: part.delta
                                                ?.role,
                                            content: "",
                                        };
                                    }
                                    if (part.delta.function_call &&
                                        !choice.message.function_call) {
                                        choice.message.function_call = {
                                            name: "",
                                            arguments: "",
                                        };
                                    }
                                    choice.message.content += part.delta?.content ?? "";
                                    if (choice.message.function_call) {
                                        choice.message.function_call.name +=
                                            part.delta?.function_call?.name ?? "";
                                        choice.message.function_call.arguments +=
                                            part.delta?.function_call?.arguments ?? "";
                                    }
                                    // eslint-disable-next-line no-void
                                    void runManager?.handleLLMNewToken(part.delta?.content ?? "", {
                                        prompt: options.promptIndex ?? 0,
                                        completion: part.index,
                                    });
                                    // TODO we don't currently have a callback method for
                                    // sending the function call arguments
                                }
                            }
                            // when all messages are finished, resolve
                            if (!resolved &&
                                !rejected &&
                                message.choices?.every((c) => c.finish_reason != null)) {
                                resolved = true;
                                resolve(response);
                            }
                        }
                    },
                }).catch((error) => {
                    if (!rejected) {
                        rejected = true;
                        reject(error);
                    }
                });
            })
            : await this.completionWithRetry({
                ...params,
                messages: messagesMapped,
            }, {
                signal: options?.signal,
                ...options?.options,
            });
        const { completion_tokens: completionTokens, prompt_tokens: promptTokens, total_tokens: totalTokens, } = data.usage ?? {};
        if (completionTokens) {
            tokenUsage.completionTokens =
                (tokenUsage.completionTokens ?? 0) + completionTokens;
        }
        if (promptTokens) {
            tokenUsage.promptTokens = (tokenUsage.promptTokens ?? 0) + promptTokens;
        }
        if (totalTokens) {
            tokenUsage.totalTokens = (tokenUsage.totalTokens ?? 0) + totalTokens;
        }
        const generations = [];
        for (const part of data.choices) {
            const text = part.message?.content ?? "";
            generations.push({
                text,
                message: openAIResponseToChatMessage(part.message ?? { role: "assistant" }),
            });
        }
        return {
            generations,
            llmOutput: { tokenUsage },
        };
    }
    async getNumTokensFromMessages(messages) {
        let totalCount = 0;
        let tokensPerMessage = 0;
        let tokensPerName = 0;
        // From: https://github.com/openai/openai-cookbook/blob/main/examples/How_to_format_inputs_to_ChatGPT_models.ipynb
        if ((0, count_tokens_js_1.getModelNameForTiktoken)(this.modelName) === "gpt-3.5-turbo") {
            tokensPerMessage = 4;
            tokensPerName = -1;
        }
        else if ((0, count_tokens_js_1.getModelNameForTiktoken)(this.modelName).startsWith("gpt-4")) {
            tokensPerMessage = 3;
            tokensPerName = 1;
        }
        const countPerMessage = await Promise.all(messages.map(async (message) => {
            const textCount = await this.getNumTokens(message.content);
            const roleCount = await this.getNumTokens(messageTypeToOpenAIRole(message._getType()));
            const nameCount = message.name !== undefined
                ? tokensPerName + (await this.getNumTokens(message.name))
                : 0;
            const count = textCount + tokensPerMessage + roleCount + nameCount;
            totalCount += count;
            return count;
        }));
        totalCount += 3; // every reply is primed with <|start|>assistant<|message|>
        return { totalCount, countPerMessage };
    }
    /** @ignore */
    async completionWithRetry(request, options) {
        if (!this.client) {
            const openAIEndpointConfig = {
                azureOpenAIApiDeploymentName: this.azureOpenAIApiDeploymentName,
                azureOpenAIApiInstanceName: this.azureOpenAIApiInstanceName,
                azureOpenAIApiKey: this.azureOpenAIApiKey,
                azureOpenAIBasePath: this.azureOpenAIBasePath,
                basePath: this.clientConfig.basePath,
            };
            const endpoint = (0, azure_js_1.getEndpoint)(openAIEndpointConfig);
            const clientConfig = new openai_1.Configuration({
                ...this.clientConfig,
                basePath: endpoint,
                baseOptions: {
                    timeout: this.timeout,
                    ...this.clientConfig.baseOptions,
                },
            });
            this.client = new openai_1.OpenAIApi(clientConfig);
        }
        const axiosOptions = {
            adapter: (0, env_js_1.isNode)() ? undefined : axios_fetch_adapter_js_1.default,
            ...this.clientConfig.baseOptions,
            ...options,
        };
        if (this.azureOpenAIApiKey) {
            axiosOptions.headers = {
                "api-key": this.azureOpenAIApiKey,
                ...axiosOptions.headers,
            };
            axiosOptions.params = {
                "api-version": this.azureOpenAIApiVersion,
                ...axiosOptions.params,
            };
        }
        return this.caller
            .call(this.client.createChatCompletion.bind(this.client), request, axiosOptions)
            .then((res) => res.data);
    }
    _llmType() {
        return "openai";
    }
    /** @ignore */
    _combineLLMOutput(...llmOutputs) {
        return llmOutputs.reduce((acc, llmOutput) => {
            if (llmOutput && llmOutput.tokenUsage) {
                acc.tokenUsage.completionTokens +=
                    llmOutput.tokenUsage.completionTokens ?? 0;
                acc.tokenUsage.promptTokens += llmOutput.tokenUsage.promptTokens ?? 0;
                acc.tokenUsage.totalTokens += llmOutput.tokenUsage.totalTokens ?? 0;
            }
            return acc;
        }, {
            tokenUsage: {
                completionTokens: 0,
                promptTokens: 0,
                totalTokens: 0,
            },
        });
    }
}
exports.ChatOpenAI = ChatOpenAI;
class PromptLayerChatOpenAI extends ChatOpenAI {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "promptLayerApiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "plTags", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "returnPromptLayerId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.promptLayerApiKey =
            fields?.promptLayerApiKey ??
                (typeof process !== "undefined"
                    ? // eslint-disable-next-line no-process-env
                        process.env?.PROMPTLAYER_API_KEY
                    : undefined);
        this.plTags = fields?.plTags ?? [];
        this.returnPromptLayerId = fields?.returnPromptLayerId ?? false;
    }
    async _generate(messages, options, runManager) {
        const requestStartTime = Date.now();
        let parsedOptions;
        if (Array.isArray(options)) {
            parsedOptions = { stop: options };
        }
        else if (options?.timeout && !options.signal) {
            parsedOptions = {
                ...options,
                signal: AbortSignal.timeout(options.timeout),
            };
        }
        else {
            parsedOptions = options ?? {};
        }
        const generatedResponses = await super._generate(messages, parsedOptions, runManager);
        const requestEndTime = Date.now();
        const _convertMessageToDict = (message) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let messageDict;
            if (message._getType() === "human") {
                messageDict = { role: "user", content: message.content };
            }
            else if (message._getType() === "ai") {
                messageDict = { role: "assistant", content: message.content };
            }
            else if (message._getType() === "system") {
                messageDict = { role: "system", content: message.content };
            }
            else if (message._getType() === "generic") {
                messageDict = {
                    role: message.role,
                    content: message.content,
                };
            }
            else {
                throw new Error(`Got unknown type ${message}`);
            }
            return messageDict;
        };
        const _createMessageDicts = (messages, callOptions) => {
            const params = {
                ...this.invocationParams(),
                model: this.modelName,
            };
            if (callOptions?.stop) {
                if (Object.keys(params).includes("stop")) {
                    throw new Error("`stop` found in both the input and default params.");
                }
            }
            const messageDicts = messages.map((message) => _convertMessageToDict(message));
            return messageDicts;
        };
        for (let i = 0; i < generatedResponses.generations.length; i += 1) {
            const generation = generatedResponses.generations[i];
            const messageDicts = _createMessageDicts(messages, parsedOptions);
            let promptLayerRequestId;
            const parsedResp = [
                {
                    content: generation.text,
                    role: messageTypeToOpenAIRole(generation.message._getType()),
                },
            ];
            const promptLayerRespBody = await (0, prompt_layer_js_1.promptLayerTrackRequest)(this.caller, "langchain.PromptLayerChatOpenAI", messageDicts, this._identifyingParams(), this.plTags, parsedResp, requestStartTime, requestEndTime, this.promptLayerApiKey);
            if (this.returnPromptLayerId === true) {
                if (promptLayerRespBody.success === true) {
                    promptLayerRequestId = promptLayerRespBody.request_id;
                }
                if (!generation.generationInfo ||
                    typeof generation.generationInfo !== "object") {
                    generation.generationInfo = {};
                }
                generation.generationInfo.promptLayerRequestId = promptLayerRequestId;
            }
        }
        return generatedResponses;
    }
}
exports.PromptLayerChatOpenAI = PromptLayerChatOpenAI;
