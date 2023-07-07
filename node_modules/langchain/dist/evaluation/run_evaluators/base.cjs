"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunEvaluatorChain = exports.RunEvaluatorOutputParser = exports.RunEvaluatorInputMapper = void 0;
const output_parser_js_1 = require("../../schema/output_parser.cjs");
const base_js_1 = require("../../chains/base.cjs");
class RunEvaluatorInputMapper {
}
exports.RunEvaluatorInputMapper = RunEvaluatorInputMapper;
/**
 * An abstract class that extends BaseOutputParser and implements IRunEvaluatorOutputParser.
 * It provides a method for parsing a dictionary to an EvaluationResult.
 */
class RunEvaluatorOutputParser extends output_parser_js_1.BaseOutputParser {
    constructor({ evalChain_output_key, } = {}) {
        super();
        /**
         * The key in the chain output that contains the eval results
         */
        Object.defineProperty(this, "evalChain_output_key", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.evalChain_output_key = evalChain_output_key || "text";
    }
    async parseChainInput(output) {
        const text = output[this.evalChain_output_key];
        return await this.parse(text);
    }
}
exports.RunEvaluatorOutputParser = RunEvaluatorOutputParser;
class RunEvaluatorChain extends base_js_1.BaseChain {
    constructor(options) {
        super();
        // Maps Run and Example objects to chain inputs
        Object.defineProperty(this, "inputMapper", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // The LLMChain to use for running the core logic of the chain.
        Object.defineProperty(this, "evalChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Parses chain output into an EvaluationResult
        Object.defineProperty(this, "outputParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.inputMapper = options.inputMapper;
        this.evalChain = options.evalChain;
        this.outputParser = options.outputParser;
    }
    get inputKeys() {
        return ["run", "example"];
    }
    get outputKeys() {
        return ["feedback"];
    }
    _chainType() {
        return "run_evaluator";
    }
    /**
     * Runs the core logic of this chain and returns the output.
     * @param values - The input values for the chain.
     * @param runManager - The optional CallbackManager
     * @returns The output of the chain.
     */
    async _call(values, runManager) {
        const chain_input = this.inputMapper.map(values.run, values.example);
        const chain_output = await this.evalChain.call(chain_input, runManager?.getChild());
        const feedback = this.outputParser.parseChainInput(chain_output);
        return { feedback };
    }
    /**
     * Evaluates a Run and returns the EvaluationResult.
     * @param run - The Run to evaluate.
     * @param example - The optional Example containing the ground truth outputs for the Run.
     * @returns The EvaluationResult.
     */
    async evaluateRun(run, example) {
        const evaluationResult = await this._call({ run, example });
        return evaluationResult.feedback;
    }
}
exports.RunEvaluatorChain = RunEvaluatorChain;
