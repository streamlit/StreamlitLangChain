import { BaseLLMOutputParser } from "../schema/output_parser.js";
export class OutputFunctionsParser extends BaseLLMOutputParser {
    constructor(config) {
        super();
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "chains", "openai_functions"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "argsOnly", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        this.argsOnly = config?.argsOnly ?? this.argsOnly;
    }
    async parseResult(generations) {
        if ("message" in generations[0]) {
            const gen = generations[0];
            const functionCall = gen.message.additional_kwargs.function_call;
            if (!functionCall) {
                throw new Error(`No function_call in message ${JSON.stringify(generations)}`);
            }
            if (!functionCall.arguments) {
                throw new Error(`No arguments in function_call ${JSON.stringify(generations)}`);
            }
            if (this.argsOnly) {
                return functionCall.arguments;
            }
            return JSON.stringify(functionCall);
        }
        else {
            throw new Error(`No message in generations ${JSON.stringify(generations)}`);
        }
    }
}
export class JsonOutputFunctionsParser extends BaseLLMOutputParser {
    constructor(config) {
        super();
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "chains", "openai_functions"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "outputParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "argsOnly", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        this.argsOnly = config?.argsOnly ?? this.argsOnly;
        this.outputParser = new OutputFunctionsParser(config);
    }
    async parseResult(generations) {
        const result = await this.outputParser.parseResult(generations);
        if (!result) {
            throw new Error(`No result from "OutputFunctionsParser" ${JSON.stringify(generations)}`);
        }
        const parsedResult = JSON.parse(result);
        if (this.argsOnly) {
            return parsedResult;
        }
        parsedResult.arguments = JSON.parse(parsedResult.arguments);
        return parsedResult;
    }
}
export class JsonKeyOutputFunctionsParser extends BaseLLMOutputParser {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "chains", "openai_functions"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "outputParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new JsonOutputFunctionsParser()
        });
        Object.defineProperty(this, "attrName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.attrName = fields.attrName;
    }
    async parseResult(generations) {
        const result = await this.outputParser.parseResult(generations);
        return result[this.attrName];
    }
}
