import { JsonSchema7ObjectType } from "zod-to-json-schema/src/parsers/object.js";
import { ChatGeneration, Generation } from "../schema/index.js";
import { Optional } from "../types/type-utils.js";
import { BaseLLMOutputParser } from "../schema/output_parser.js";
export type FunctionParameters = Optional<JsonSchema7ObjectType, "additionalProperties">;
export declare class OutputFunctionsParser extends BaseLLMOutputParser<string> {
    lc_namespace: string[];
    lc_serializable: boolean;
    argsOnly: boolean;
    constructor(config?: {
        argsOnly: boolean;
    });
    parseResult(generations: Generation[] | ChatGeneration[]): Promise<string>;
}
export declare class JsonOutputFunctionsParser extends BaseLLMOutputParser<object> {
    lc_namespace: string[];
    lc_serializable: boolean;
    outputParser: OutputFunctionsParser;
    argsOnly: boolean;
    constructor(config?: {
        argsOnly: boolean;
    });
    parseResult(generations: Generation[] | ChatGeneration[]): Promise<object>;
}
export declare class JsonKeyOutputFunctionsParser<T = object> extends BaseLLMOutputParser<T> {
    lc_namespace: string[];
    lc_serializable: boolean;
    outputParser: JsonOutputFunctionsParser;
    attrName: string;
    constructor(fields: {
        attrName: string;
    });
    parseResult(generations: Generation[] | ChatGeneration[]): Promise<T>;
}
