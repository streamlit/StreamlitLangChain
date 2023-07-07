import { BaseChain } from "./base.js";
export class TransformChain extends BaseChain {
    _chainType() {
        return "transform";
    }
    get inputKeys() {
        return this.inputVariables;
    }
    get outputKeys() {
        return this.outputVariables;
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "transform", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inputVariables", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "outputVariables", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.transform = fields.transform;
        this.inputVariables = fields.inputVariables;
        this.outputVariables = fields.outputVariables;
    }
    async _call(values, runManager) {
        return this.transform(values, runManager?.getChild("transform"));
    }
}
