import { BaseOutputParser } from "../../schema/output_parser.js";
import { Plan } from "./base.js";
export declare class PlanOutputParser extends BaseOutputParser<Plan> {
    lc_namespace: string[];
    parse(text: string): Promise<Plan>;
    getFormatInstructions(): string;
}
