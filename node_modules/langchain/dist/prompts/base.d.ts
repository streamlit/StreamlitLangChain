import { BasePromptValue, Example, HumanMessage, InputValues, PartialValues } from "../schema/index.js";
import { BaseOutputParser } from "../schema/output_parser.js";
import { Serializable } from "../load/serializable.js";
import { SerializedBasePromptTemplate } from "./serde.js";
import { SerializedFields } from "../load/map_keys.js";
export declare class StringPromptValue extends BasePromptValue {
    lc_namespace: string[];
    value: string;
    constructor(value: string);
    toString(): string;
    toChatMessages(): HumanMessage[];
}
/**
 * Input common to all prompt templates.
 */
export interface BasePromptTemplateInput {
    /**
     * A list of variable names the prompt template expects
     */
    inputVariables: string[];
    /**
     * How to parse the output of calling an LLM on this formatted prompt
     */
    outputParser?: BaseOutputParser;
    /** Partial variables */
    partialVariables?: PartialValues;
}
/**
 * Base class for prompt templates. Exposes a format method that returns a
 * string prompt given a set of input values.
 */
export declare abstract class BasePromptTemplate extends Serializable implements BasePromptTemplateInput {
    PromptValueReturnType: BasePromptValue;
    lc_serializable: boolean;
    lc_namespace: string[];
    get lc_attributes(): SerializedFields | undefined;
    inputVariables: string[];
    outputParser?: BaseOutputParser;
    partialVariables: InputValues;
    constructor(input: BasePromptTemplateInput);
    abstract partial(values: PartialValues): Promise<BasePromptTemplate>;
    mergePartialAndUserVariables(userVariables: InputValues): Promise<InputValues>;
    /**
     * Format the prompt given the input values.
     *
     * @param values - A dictionary of arguments to be passed to the prompt template.
     * @returns A formatted prompt string.
     *
     * @example
     * ```ts
     * prompt.format({ foo: "bar" });
     * ```
     */
    abstract format(values: InputValues): Promise<string>;
    /**
     * Format the prompt given the input values and return a formatted prompt value.
     * @param values
     * @returns A formatted PromptValue.
     */
    abstract formatPromptValue(values: InputValues): Promise<BasePromptValue>;
    /**
     * Return the string type key uniquely identifying this class of prompt template.
     */
    abstract _getPromptType(): string;
    /**
     * Return a json-like object representing this prompt template.
     * @deprecated
     */
    serialize(): SerializedBasePromptTemplate;
    /**
     * @deprecated
     * Load a prompt template from a json-like object describing it.
     *
     * @remarks
     * Deserializing needs to be async because templates (e.g. {@link FewShotPromptTemplate}) can
     * reference remote resources that we read asynchronously with a web
     * request.
     */
    static deserialize(data: SerializedBasePromptTemplate): Promise<BasePromptTemplate>;
}
export declare abstract class BaseStringPromptTemplate extends BasePromptTemplate {
    formatPromptValue(values: InputValues): Promise<StringPromptValue>;
}
/**
 * Base class for example selectors.
 */
export declare abstract class BaseExampleSelector extends Serializable {
    lc_namespace: string[];
    abstract addExample(example: Example): Promise<void | string>;
    abstract selectExamples(input_variables: Example): Promise<Example[]>;
}
