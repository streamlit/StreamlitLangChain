"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleChatModel = exports.BaseChatModel = void 0;
const index_js_1 = require("../schema/index.cjs");
const index_js_2 = require("../base_language/index.cjs");
const manager_js_1 = require("../callbacks/manager.cjs");
class BaseChatModel extends index_js_2.BaseLanguageModel {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "chat_models", this._llmType()]
        });
    }
    async generate(messages, options, callbacks) {
        // parse call options
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
        const handledOptions = {
            tags: parsedOptions.tags,
            metadata: parsedOptions.metadata,
            callbacks: parsedOptions.callbacks ?? callbacks,
        };
        delete parsedOptions.tags;
        delete parsedOptions.metadata;
        delete parsedOptions.callbacks;
        // create callback manager and start run
        const callbackManager_ = await manager_js_1.CallbackManager.configure(handledOptions.callbacks, this.callbacks, handledOptions.tags, this.tags, handledOptions.metadata, this.metadata, { verbose: this.verbose });
        const extra = {
            options: parsedOptions,
            invocation_params: this?.invocationParams(parsedOptions),
        };
        const runManagers = await callbackManager_?.handleChatModelStart(this.toJSON(), messages, undefined, undefined, extra);
        // generate results
        const results = await Promise.allSettled(messages.map((messageList, i) => this._generate(messageList, { ...parsedOptions, promptIndex: i }, runManagers?.[i])));
        // handle results
        const generations = [];
        const llmOutputs = [];
        await Promise.all(results.map(async (pResult, i) => {
            if (pResult.status === "fulfilled") {
                const result = pResult.value;
                generations[i] = result.generations;
                llmOutputs[i] = result.llmOutput;
                return runManagers?.[i]?.handleLLMEnd({
                    generations: [result.generations],
                    llmOutput: result.llmOutput,
                });
            }
            else {
                // status === "rejected"
                await runManagers?.[i]?.handleLLMError(pResult.reason);
                return Promise.reject(pResult.reason);
            }
        }));
        // create combined output
        const output = {
            generations,
            llmOutput: llmOutputs.length
                ? this._combineLLMOutput?.(...llmOutputs)
                : undefined,
        };
        Object.defineProperty(output, index_js_1.RUN_KEY, {
            value: runManagers
                ? { runIds: runManagers?.map((manager) => manager.runId) }
                : undefined,
            configurable: true,
        });
        return output;
    }
    /**
     * Get the parameters used to invoke the model
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    invocationParams(_options) {
        return {};
    }
    _modelType() {
        return "base_chat_model";
    }
    async generatePrompt(promptValues, options, callbacks) {
        const promptMessages = promptValues.map((promptValue) => promptValue.toChatMessages());
        return this.generate(promptMessages, options, callbacks);
    }
    async call(messages, options, callbacks) {
        const result = await this.generate([messages], options, callbacks);
        const generations = result.generations;
        return generations[0][0].message;
    }
    async callPrompt(promptValue, options, callbacks) {
        const promptMessages = promptValue.toChatMessages();
        return this.call(promptMessages, options, callbacks);
    }
    async predictMessages(messages, options, callbacks) {
        return this.call(messages, options, callbacks);
    }
    async predict(text, options, callbacks) {
        const message = new index_js_1.HumanMessage(text);
        const result = await this.call([message], options, callbacks);
        return result.content;
    }
}
exports.BaseChatModel = BaseChatModel;
class SimpleChatModel extends BaseChatModel {
    async _generate(messages, options, runManager) {
        const text = await this._call(messages, options, runManager);
        const message = new index_js_1.AIMessage(text);
        return {
            generations: [
                {
                    text: message.content,
                    message,
                },
            ],
        };
    }
}
exports.SimpleChatModel = SimpleChatModel;
