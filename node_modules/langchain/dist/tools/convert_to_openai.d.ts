import { ChatCompletionFunctions } from "openai";
import { StructuredTool } from "./base.js";
export declare function formatToOpenAIFunction(tool: StructuredTool): ChatCompletionFunctions;
