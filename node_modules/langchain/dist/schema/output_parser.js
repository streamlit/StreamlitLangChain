import { Serializable } from "../load/serializable.js";
export class BaseLLMOutputParser extends Serializable {
    parseResultWithPrompt(generations, _prompt, callbacks) {
        return this.parseResult(generations, callbacks);
    }
}
/** Class to parse the output of an LLM call.
 */
export class BaseOutputParser extends BaseLLMOutputParser {
    parseResult(generations, callbacks) {
        return this.parse(generations[0].text, callbacks);
    }
    async parseWithPrompt(text, _prompt, callbacks) {
        return this.parse(text, callbacks);
    }
    /**
     * Return the string type key uniquely identifying this class of parser
     */
    _type() {
        throw new Error("_type not implemented");
    }
}
export class OutputParserException extends Error {
    constructor(message, output) {
        super(message);
        Object.defineProperty(this, "output", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.output = output;
    }
}
