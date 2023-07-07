import { Comparators, Operators, } from "../../chains/query_constructor/ir.js";
import { BaseTranslator } from "./base.js";
export class WeaviateTranslator extends BaseTranslator {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "allowedOperators", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [Operators.and, Operators.or]
        });
        Object.defineProperty(this, "allowedComparators", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [
                Comparators.eq,
                Comparators.ne,
                Comparators.lt,
                Comparators.lte,
                Comparators.gt,
                Comparators.gte,
            ]
        });
    }
    formatFunction(func) {
        if (func in Comparators) {
            if (this.allowedComparators.length > 0 &&
                this.allowedComparators.indexOf(func) === -1) {
                throw new Error(`Comparator ${func} not allowed. Allowed operators: ${this.allowedComparators.join(", ")}`);
            }
        }
        else if (func in Operators) {
            if (this.allowedOperators.length > 0 &&
                this.allowedOperators.indexOf(func) === -1) {
                throw new Error(`Operator ${func} not allowed. Allowed operators: ${this.allowedOperators.join(", ")}`);
            }
        }
        else {
            throw new Error("Unknown comparator or operator");
        }
        const dict = {
            and: "And",
            or: "Or",
            eq: "Equal",
            ne: "NotEqual",
            lt: "LessThan",
            lte: "LessThanEqual",
            gt: "GreaterThan",
            gte: "GreaterThanEqual",
        };
        return dict[func];
    }
    visitOperation(operation) {
        const args = operation.args?.map((arg) => arg.accept(this));
        return {
            operator: this.formatFunction(operation.operator),
            operands: args,
        };
    }
    visitComparison(comparison) {
        if (typeof comparison.value === "string") {
            return {
                path: [comparison.attribute],
                operator: this.formatFunction(comparison.comparator),
                valueText: comparison.value,
            };
        }
        if (typeof comparison.value === "number") {
            if (Number.isInteger(comparison.value)) {
                return {
                    path: [comparison.attribute],
                    operator: this.formatFunction(comparison.comparator),
                    valueInt: comparison.value,
                };
            }
            else {
                return {
                    path: [comparison.attribute],
                    operator: this.formatFunction(comparison.comparator),
                    valueNumber: comparison.value,
                };
            }
        }
        throw new Error("Value type is not supported");
    }
    visitStructuredQuery(query) {
        let nextArg = {};
        if (query.filter) {
            nextArg = {
                filter: { where: query.filter.accept(this) },
            };
        }
        return nextArg;
    }
}
