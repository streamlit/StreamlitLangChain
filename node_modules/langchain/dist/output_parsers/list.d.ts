import { BaseOutputParser } from "../schema/output_parser.js";
/**
 * Class to parse the output of an LLM call to a list.
 * @augments BaseOutputParser
 */
export declare abstract class ListOutputParser extends BaseOutputParser<string[]> {
}
/**
 * Class to parse the output of an LLM call as a comma-separated list.
 * @augments ListOutputParser
 */
export declare class CommaSeparatedListOutputParser extends ListOutputParser {
    lc_namespace: string[];
    lc_serializable: boolean;
    parse(text: string): Promise<string[]>;
    getFormatInstructions(): string;
}
/**
 * Class to parse the output of an LLM call to a list with a specific length and separator.
 * @augments ListOutputParser
 */
export declare class CustomListOutputParser extends ListOutputParser {
    lc_namespace: string[];
    private length;
    private separator;
    constructor({ length, separator }: {
        length?: number;
        separator?: string;
    });
    parse(text: string): Promise<string[]>;
    getFormatInstructions(): string;
}
