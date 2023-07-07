"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatToOpenAIFunction = void 0;
const zod_to_json_schema_1 = require("zod-to-json-schema");
function formatToOpenAIFunction(tool) {
    return {
        name: tool.name,
        description: tool.description,
        parameters: (0, zod_to_json_schema_1.zodToJsonSchema)(tool.schema),
    };
}
exports.formatToOpenAIFunction = formatToOpenAIFunction;
