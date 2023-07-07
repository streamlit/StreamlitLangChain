import { Comparator, Comparison, Operation, Operator, StructuredQuery } from "../../chains/query_constructor/ir.js";
import { BaseTranslator } from "./base.js";
type WeaviateOperatorValues = {
    valueText: string;
    valueInt: number;
    valueNumber: number;
    valueBoolean: boolean;
};
type WeaviateOperatorKeys = keyof WeaviateOperatorValues;
type ExclusiveOperatorValue = {
    [L in WeaviateOperatorKeys]: {
        [key in L]: WeaviateOperatorValues[key];
    } & Omit<{
        [key in WeaviateOperatorKeys]?: never;
    }, L>;
}[WeaviateOperatorKeys];
export type WeaviateVisitorResult = WeaviateOperationResult | WeaviateComparisonResult | WeaviateStructuredQueryResult;
export type WeaviateOperationResult = {
    operator: string;
    operands: WeaviateVisitorResult[];
};
export type WeaviateComparisonResult = {
    path: [string];
    operator: string;
} & ExclusiveOperatorValue;
export type WeaviateStructuredQueryResult = {
    filter?: WeaviateComparisonResult | WeaviateOperationResult | WeaviateStructuredQueryResult;
};
export declare class WeaviateTranslator extends BaseTranslator {
    VisitOperationOutput: WeaviateOperationResult;
    VisitComparisonOutput: WeaviateComparisonResult;
    VisitStructuredQueryOutput: WeaviateStructuredQueryResult;
    allowedOperators: Operator[];
    allowedComparators: Comparator[];
    formatFunction(func: Operator | Comparator): string;
    visitOperation(operation: Operation): this["VisitOperationOutput"];
    visitComparison(comparison: Comparison): this["VisitComparisonOutput"];
    visitStructuredQuery(query: StructuredQuery): this["VisitStructuredQueryOutput"];
}
export {};
