import { CallbackManagerForChainRun, Callbacks } from "../callbacks/manager.js";
import { ChainValues } from "../schema/index.js";
import { ChainInputs, BaseChain } from "./base.js";
export interface TransformChainFields<I extends ChainValues, O extends ChainValues> extends ChainInputs {
    transform: (values: I, callbacks?: Callbacks) => O | Promise<O>;
    inputVariables: (keyof I extends string ? keyof I : never)[];
    outputVariables: (keyof O extends string ? keyof O : never)[];
}
export declare class TransformChain<I extends ChainValues, O extends ChainValues> extends BaseChain implements TransformChainFields<I, O> {
    transform: (values: I, callbacks?: Callbacks) => O | Promise<O>;
    inputVariables: (keyof I extends string ? keyof I : never)[];
    outputVariables: (keyof O extends string ? keyof O : never)[];
    _chainType(): "transform";
    get inputKeys(): (keyof I extends string ? keyof I : never)[];
    get outputKeys(): (keyof O extends string ? keyof O : never)[];
    constructor(fields: TransformChainFields<I, O>);
    _call(values: I, runManager?: CallbackManagerForChainRun): Promise<O>;
}
