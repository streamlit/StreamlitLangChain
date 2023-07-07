import { BaseOutputParser } from "../../schema/output_parser.js";
import { PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE } from "./prompt.js";
export class PlanOutputParser extends BaseOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "experimental", "plan_and_execute"]
        });
    }
    async parse(text) {
        return {
            steps: text
                .split(/\n\d+\.\s?/)
                .slice(1)
                .map((step) => ({ text: step.replace(`<END_OF_PLAN>`, "") })),
        };
    }
    getFormatInstructions() {
        return PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE;
    }
}
