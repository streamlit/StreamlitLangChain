"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExtractionChainFromZod = exports.createExtractionChain = void 0;
const zod_to_json_schema_1 = require("zod-to-json-schema");
const prompt_js_1 = require("../../prompts/prompt.cjs");
const openai_functions_js_1 = require("../../output_parsers/openai_functions.cjs");
const llm_chain_js_1 = require("../llm_chain.cjs");
function getExtractionFunctions(schema) {
    return [
        {
            name: "information_extraction",
            description: "Extracts the relevant information from the passage.",
            parameters: {
                type: "object",
                properties: {
                    info: {
                        type: "array",
                        items: {
                            type: schema.type,
                            properties: schema.properties,
                            required: schema.required,
                        },
                    },
                },
                required: ["info"],
            },
        },
    ];
}
const _EXTRACTION_TEMPLATE = `Extract and save the relevant entities mentioned in the following passage together with their properties.

Passage:
{input}
`;
function createExtractionChain(schema, llm) {
    const functions = getExtractionFunctions(schema);
    const prompt = prompt_js_1.PromptTemplate.fromTemplate(_EXTRACTION_TEMPLATE);
    const outputParser = new openai_functions_js_1.JsonKeyOutputFunctionsParser({ attrName: "info" });
    return new llm_chain_js_1.LLMChain({
        llm,
        prompt,
        llmKwargs: { functions },
        outputParser,
        tags: ["openai_functions", "extraction"],
    });
}
exports.createExtractionChain = createExtractionChain;
function createExtractionChainFromZod(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
schema, llm) {
    return createExtractionChain((0, zod_to_json_schema_1.zodToJsonSchema)(schema), llm);
}
exports.createExtractionChainFromZod = createExtractionChainFromZod;
