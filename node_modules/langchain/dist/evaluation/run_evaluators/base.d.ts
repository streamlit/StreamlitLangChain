import { Example, Run } from "langchainplus-sdk";
import { EvaluationResult, RunEvaluator } from "langchainplus-sdk/evaluation";
import { BaseOutputParser } from "../../schema/output_parser.js";
import { LLMChain } from "../../chains/llm_chain.js";
import { BaseChain } from "../../chains/base.js";
import { ChainValues } from "../../schema/index.js";
import { CallbackManagerForChainRun } from "../../callbacks/manager.js";
export declare abstract class RunEvaluatorInputMapper {
    /**
     * Maps a Run and an optional Example to a dictionary.
     *
     * @param run - The traced Run to evaluate.
     * @param example - The optional Example containing the ground truth outputs for the Run.
     * @returns A dictionary that represents the mapping.
     */
    abstract map(run: Run, example?: Example): ChainValues;
}
interface IRunEvaluatorOutputParser extends BaseOutputParser<EvaluationResult> {
    parseChainInput(output: ChainValues): Promise<EvaluationResult>;
}
/**
 * An abstract class that extends BaseOutputParser and implements IRunEvaluatorOutputParser.
 * It provides a method for parsing a dictionary to an EvaluationResult.
 */
export declare abstract class RunEvaluatorOutputParser extends BaseOutputParser<EvaluationResult> implements IRunEvaluatorOutputParser {
    /**
     * The key in the chain output that contains the eval results
     */
    evalChain_output_key: string;
    constructor({ evalChain_output_key, }?: {
        evalChain_output_key?: string;
    });
    parseChainInput(output: ChainValues): Promise<EvaluationResult>;
}
export interface RunEvaluatorChainOpts {
    inputMapper: RunEvaluatorInputMapper;
    evalChain: LLMChain;
    outputParser: RunEvaluatorOutputParser;
}
export declare class RunEvaluatorChain extends BaseChain implements RunEvaluator {
    inputMapper: RunEvaluatorInputMapper;
    evalChain: LLMChain;
    outputParser: RunEvaluatorOutputParser;
    constructor(options: RunEvaluatorChainOpts);
    get inputKeys(): string[];
    get outputKeys(): string[];
    _chainType(): string;
    /**
     * Runs the core logic of this chain and returns the output.
     * @param values - The input values for the chain.
     * @param runManager - The optional CallbackManager
     * @returns The output of the chain.
     */
    _call(values: ChainValues, runManager?: CallbackManagerForChainRun): Promise<ChainValues>;
    /**
     * Evaluates a Run and returns the EvaluationResult.
     * @param run - The Run to evaluate.
     * @param example - The optional Example containing the ground truth outputs for the Run.
     * @returns The EvaluationResult.
     */
    evaluateRun(run: Run, example?: Example): Promise<EvaluationResult>;
}
export {};
