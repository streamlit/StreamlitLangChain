import { Callbacks } from "../callbacks/manager.js";
import { BasePromptValue, Generation, ChatGeneration } from "./index.js";
import { Serializable } from "../load/serializable.js";
/**
 * Options for formatting instructions.
 */
export interface FormatInstructionsOptions {
}
export declare abstract class BaseLLMOutputParser<T = unknown> extends Serializable {
    abstract parseResult(generations: Generation[] | ChatGeneration[], callbacks?: Callbacks): Promise<T>;
    parseResultWithPrompt(generations: Generation[] | ChatGeneration[], _prompt: BasePromptValue, callbacks?: Callbacks): Promise<T>;
}
/** Class to parse the output of an LLM call.
 */
export declare abstract class BaseOutputParser<T = unknown> extends BaseLLMOutputParser<T> {
    parseResult(generations: Generation[] | ChatGeneration[], callbacks?: Callbacks): Promise<T>;
    /**
     * Parse the output of an LLM call.
     *
     * @param text - LLM output to parse.
     * @returns Parsed output.
     */
    abstract parse(text: string, callbacks?: Callbacks): Promise<T>;
    parseWithPrompt(text: string, _prompt: BasePromptValue, callbacks?: Callbacks): Promise<T>;
    /**
     * Return a string describing the format of the output.
     * @returns Format instructions.
     * @param options - Options for formatting instructions.
     * @example
     * ```json
     * {
     *  "foo": "bar"
     * }
     * ```
     */
    abstract getFormatInstructions(options?: FormatInstructionsOptions): string;
    /**
     * Return the string type key uniquely identifying this class of parser
     */
    _type(): string;
}
export declare class OutputParserException extends Error {
    output?: string;
    constructor(message: string, output?: string);
}
