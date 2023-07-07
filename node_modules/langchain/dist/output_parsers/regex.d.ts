import { SerializedFields } from "../load/map_keys.js";
import { BaseOutputParser } from "../schema/output_parser.js";
export interface RegExpFields {
    pattern: string;
    flags?: string;
}
export interface RegexParserFields {
    regex: string | RegExp | RegExpFields;
    outputKeys: string[];
    defaultOutputKey?: string;
}
/**
 * Class to parse the output of an LLM call into a dictionary.
 * @augments BaseOutputParser
 */
export declare class RegexParser extends BaseOutputParser<Record<string, string>> {
    lc_namespace: string[];
    lc_serializable: boolean;
    get lc_attributes(): SerializedFields | undefined;
    regex: string | RegExp;
    outputKeys: string[];
    defaultOutputKey?: string;
    constructor(fields: RegexParserFields);
    constructor(regex: string | RegExp, outputKeys: string[], defaultOutputKey?: string);
    _type(): string;
    parse(text: string): Promise<Record<string, string>>;
    getFormatInstructions(): string;
}
