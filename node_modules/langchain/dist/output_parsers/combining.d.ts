import { Callbacks } from "../callbacks/manager.js";
import { BaseOutputParser } from "../schema/output_parser.js";
export type CombinedOutput = Record<string, any>;
export interface CombiningOutputParserFields {
    parsers: BaseOutputParser[];
}
/**
 * Class to combine multiple output parsers
 * @augments BaseOutputParser
 */
export declare class CombiningOutputParser extends BaseOutputParser<object> {
    lc_namespace: string[];
    lc_serializable: boolean;
    parsers: BaseOutputParser[];
    outputDelimiter: string;
    constructor(fields: CombiningOutputParserFields);
    constructor(...parsers: BaseOutputParser[]);
    parse(input: string, callbacks?: Callbacks): Promise<CombinedOutput>;
    getFormatInstructions(): string;
}
