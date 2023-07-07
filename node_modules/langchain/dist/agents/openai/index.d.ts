import { CallbackManager } from "../../callbacks/manager.js";
import { BasePromptTemplate } from "../../prompts/base.js";
import { AgentAction, AgentFinish, AgentStep, BaseMessage, ChainValues } from "../../schema/index.js";
import { StructuredTool } from "../../tools/base.js";
import { Agent, AgentArgs } from "../agent.js";
import { AgentInput } from "../types.js";
import { BaseLanguageModel } from "../../base_language/index.js";
export interface OpenAIAgentInput extends AgentInput {
    tools: StructuredTool[];
}
export interface OpenAIAgentCreatePromptArgs {
    prefix?: string;
}
export declare class OpenAIAgent extends Agent {
    lc_namespace: string[];
    _agentType(): "openai-functions";
    observationPrefix(): string;
    llmPrefix(): string;
    _stop(): string[];
    tools: StructuredTool[];
    constructor(input: Omit<OpenAIAgentInput, "outputParser">);
    static createPrompt(_tools: StructuredTool[], fields?: OpenAIAgentCreatePromptArgs): BasePromptTemplate;
    static fromLLMAndTools(llm: BaseLanguageModel, tools: StructuredTool[], args?: OpenAIAgentCreatePromptArgs & Pick<AgentArgs, "callbacks">): OpenAIAgent;
    constructScratchPad(steps: AgentStep[]): Promise<string | BaseMessage[]>;
    plan(steps: Array<AgentStep>, inputs: ChainValues, callbackManager?: CallbackManager): Promise<AgentAction | AgentFinish>;
}
