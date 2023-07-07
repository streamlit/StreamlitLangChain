import { AIMessage, FunctionMessage, } from "../../schema/index.js";
import { Agent } from "../agent.js";
import { PREFIX } from "./prompt.js";
import { ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder, SystemMessagePromptTemplate, } from "../../prompts/chat.js";
import { LLMChain } from "../../chains/llm_chain.js";
function parseOutput(message) {
    if (message.additional_kwargs.function_call) {
        // eslint-disable-next-line prefer-destructuring
        const function_call = message.additional_kwargs.function_call;
        return {
            tool: function_call.name,
            toolInput: function_call.arguments
                ? JSON.parse(function_call.arguments)
                : {},
            log: message.content,
        };
    }
    else {
        return { returnValues: { output: message.content }, log: message.content };
    }
}
export class OpenAIAgent extends Agent {
    _agentType() {
        return "openai-functions";
    }
    observationPrefix() {
        return "Observation: ";
    }
    llmPrefix() {
        return "Thought:";
    }
    _stop() {
        return ["Observation:"];
    }
    constructor(input) {
        super({ ...input, outputParser: undefined });
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "agents", "openai"]
        });
        Object.defineProperty(this, "tools", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.tools = input.tools;
    }
    static createPrompt(_tools, fields) {
        const { prefix = PREFIX } = fields || {};
        return ChatPromptTemplate.fromPromptMessages([
            SystemMessagePromptTemplate.fromTemplate(prefix),
            new MessagesPlaceholder("chat_history"),
            HumanMessagePromptTemplate.fromTemplate("{input}"),
            new MessagesPlaceholder("agent_scratchpad"),
        ]);
    }
    static fromLLMAndTools(llm, tools, args) {
        OpenAIAgent.validateTools(tools);
        if (llm._modelType() !== "base_chat_model" || llm._llmType() !== "openai") {
            throw new Error("OpenAIAgent requires an OpenAI chat model");
        }
        const prompt = OpenAIAgent.createPrompt(tools, args);
        const chain = new LLMChain({
            prompt,
            llm,
            callbacks: args?.callbacks,
        });
        return new OpenAIAgent({
            llmChain: chain,
            allowedTools: tools.map((t) => t.name),
            tools,
        });
    }
    async constructScratchPad(steps) {
        return steps.flatMap(({ action, observation }) => [
            new AIMessage("", {
                function_call: {
                    name: action.tool,
                    arguments: JSON.stringify(action.toolInput),
                },
            }),
            new FunctionMessage(observation, action.tool),
        ]);
    }
    async plan(steps, inputs, callbackManager) {
        // Add scratchpad and stop to inputs
        const thoughts = await this.constructScratchPad(steps);
        const newInputs = {
            ...inputs,
            agent_scratchpad: thoughts,
        };
        if (this._stop().length !== 0) {
            newInputs.stop = this._stop();
        }
        // Split inputs between prompt and llm
        const llm = this.llmChain.llm;
        const valuesForPrompt = { ...newInputs };
        const valuesForLLM = {
            tools: this.tools,
        };
        for (const key of this.llmChain.llm.callKeys) {
            if (key in inputs) {
                valuesForLLM[key] = inputs[key];
                delete valuesForPrompt[key];
            }
        }
        const promptValue = await this.llmChain.prompt.formatPromptValue(valuesForPrompt);
        const message = await llm.predictMessages(promptValue.toChatMessages(), valuesForLLM, callbackManager);
        return parseOutput(message);
    }
}
