"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoOpOutputParser = void 0;
const output_parser_js_1 = require("../schema/output_parser.cjs");
class NoOpOutputParser extends output_parser_js_1.BaseOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "output_parsers", "default"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
    parse(text) {
        return Promise.resolve(text);
    }
    getFormatInstructions() {
        return "";
    }
}
exports.NoOpOutputParser = NoOpOutputParser;
