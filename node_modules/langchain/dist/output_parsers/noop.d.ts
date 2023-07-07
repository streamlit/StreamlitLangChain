import { BaseOutputParser } from "../schema/output_parser.js";
export declare class NoOpOutputParser extends BaseOutputParser<string> {
    lc_namespace: string[];
    lc_serializable: boolean;
    parse(text: string): Promise<string>;
    getFormatInstructions(): string;
}
