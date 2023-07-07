import { FormatInstructionsOptions } from "../../schema/output_parser.js";
import { AgentActionOutputParser } from "../types.js";
import { AgentAction, AgentFinish } from "../../schema/index.js";
import { OutputFixingParser } from "../../output_parsers/fix.js";
import { BaseLanguageModel } from "../../base_language/index.js";
export type ChatConversationalAgentOutputParserFormatInstructionsOptions = FormatInstructionsOptions & {
    toolNames: string[];
    raw?: boolean;
};
export declare class ChatConversationalAgentOutputParser extends AgentActionOutputParser {
    lc_namespace: string[];
    private toolNames;
    constructor(fields: {
        toolNames: string[];
    });
    parse(text: string): Promise<AgentAction | AgentFinish>;
    getFormatInstructions(): string;
}
export type ChatConversationalAgentOutputParserArgs = {
    baseParser?: ChatConversationalAgentOutputParser;
    outputFixingParser?: OutputFixingParser<AgentAction | AgentFinish>;
    toolNames?: string[];
};
export declare class ChatConversationalAgentOutputParserWithRetries extends AgentActionOutputParser {
    lc_namespace: string[];
    private baseParser;
    private outputFixingParser?;
    private toolNames;
    constructor(fields: ChatConversationalAgentOutputParserArgs);
    getFormatInstructions(options: ChatConversationalAgentOutputParserFormatInstructionsOptions): string;
    parse(text: string): Promise<AgentAction | AgentFinish>;
    static fromLLM(llm: BaseLanguageModel, options: Omit<ChatConversationalAgentOutputParserArgs, "outputFixingParser">): ChatConversationalAgentOutputParserWithRetries;
}
