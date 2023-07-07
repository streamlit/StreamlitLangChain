import { Example } from "../../schema/index.js";
import { BaseExampleSelector } from "../base.js";
import { PromptTemplate } from "../prompt.js";
export interface LengthBasedExampleSelectorInput {
    examplePrompt: PromptTemplate;
    maxLength?: number;
    getTextLength?: (text: string) => number;
}
export declare class LengthBasedExampleSelector extends BaseExampleSelector {
    protected examples: Example[];
    examplePrompt: PromptTemplate;
    getTextLength: (text: string) => number;
    maxLength: number;
    exampleTextLengths: number[];
    constructor(data: LengthBasedExampleSelectorInput);
    addExample(example: Example): Promise<void>;
    calculateExampleTextLengths(v: number[], values: LengthBasedExampleSelector): Promise<number[]>;
    selectExamples(inputVariables: Example): Promise<Example[]>;
    static fromExamples(examples: Example[], args: LengthBasedExampleSelectorInput): Promise<LengthBasedExampleSelector>;
}
