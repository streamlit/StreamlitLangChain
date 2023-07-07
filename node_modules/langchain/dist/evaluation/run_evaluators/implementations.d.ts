import { Example, Run } from "langchainplus-sdk";
import { EvaluationResult } from "langchainplus-sdk/evaluation";
import { RunEvaluatorInputMapper, RunEvaluatorChain, RunEvaluatorOutputParser } from "./base.js";
import { PromptTemplate } from "../../prompts/prompt.js";
import { BaseLanguageModel } from "../../base_language/index.js";
import { LLMChainInput } from "../../chains/llm_chain.js";
import { ChainValues } from "../../schema/index.js";
export declare class StringRunEvaluatorInputMapper implements RunEvaluatorInputMapper {
    predictionMap: {
        [key: string]: string;
    };
    inputMap: {
        [key: string]: string;
    };
    answerMap: {
        [key: string]: string;
    } | undefined;
    constructor({ predictionMap, inputMap, answerMap, }: {
        predictionMap: {
            [key: string]: string;
        };
        inputMap: {
            [key: string]: string;
        };
        answerMap?: {
            [key: string]: string;
        };
    });
    map(run: Run, example?: Example): ChainValues;
}
export declare class ChoicesOutputParser extends RunEvaluatorOutputParser {
    evaluationName: string;
    choicesMap?: Record<string, number>;
    lc_namespace: string[];
    constructor({ evaluationName, choicesMap, }: {
        evaluationName: string;
        choicesMap?: {
            [key: string]: number;
        };
    });
    getFormatInstructions(): string;
    parse(text: string): Promise<EvaluationResult>;
}
type QAPromptType = "qa" | "sql";
type QAEvaluatorOptions = {
    prompt?: PromptTemplate | QAPromptType;
    inputKey?: string;
    predictionKey?: string;
    answerKey?: string;
    evaluationName?: string;
    chainInput?: Omit<LLMChainInput, "llm">;
};
export declare function getQAEvaluator(llm: BaseLanguageModel, options?: QAEvaluatorOptions): RunEvaluatorChain;
interface GetCriteriaEvaluatorOptions {
    prompt?: PromptTemplate;
    inputKey?: string;
    predictionKey?: string;
    evaluationName?: string;
    chainInput?: Omit<LLMChainInput, "llm">;
}
type CriteriaPromptType = "conciseness" | "relevance" | "correctness" | "coherence" | "harmfulness" | "maliciousness" | "helpfulness" | "controversiality" | "mysogyny" | "criminality" | "insensitive";
export declare function getCriteriaEvaluator(llm: BaseLanguageModel, criteria: {
    [key: string]: string;
} | CriteriaPromptType | CriteriaPromptType[], options?: GetCriteriaEvaluatorOptions): Promise<RunEvaluatorChain>;
export {};
