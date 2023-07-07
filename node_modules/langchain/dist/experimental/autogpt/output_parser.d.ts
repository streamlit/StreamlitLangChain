import { BaseOutputParser } from "../../schema/output_parser.js";
import { AutoGPTAction } from "./schema.js";
export declare function preprocessJsonInput(inputStr: string): string;
export declare class AutoGPTOutputParser extends BaseOutputParser<AutoGPTAction> {
    lc_namespace: string[];
    getFormatInstructions(): string;
    parse(text: string): Promise<AutoGPTAction>;
}
