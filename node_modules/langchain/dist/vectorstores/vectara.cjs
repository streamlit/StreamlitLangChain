"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectaraStore = void 0;
const document_js_1 = require("../document.cjs");
const fake_js_1 = require("../embeddings/fake.cjs");
const env_js_1 = require("../util/env.cjs");
const base_js_1 = require("./base.cjs");
class VectaraStore extends base_js_1.VectorStore {
    constructor(args) {
        // Vectara doesn't need embeddings, but we need to pass something to the parent constructor
        // The embeddings are abstracted out from the user in Vectara.
        super(new fake_js_1.FakeEmbeddings(), args);
        Object.defineProperty(this, "apiEndpoint", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "api.vectara.io"
        });
        Object.defineProperty(this, "apiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "corpusId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "customerId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "verbose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const apiKey = args.apiKey ?? (0, env_js_1.getEnvironmentVariable)("VECTARA_API_KEY");
        if (!apiKey) {
            throw new Error("Vectara api key is not provided.");
        }
        this.apiKey = apiKey;
        const corpusId = args.corpusId ?? (0, env_js_1.getEnvironmentVariable)("VECTARA_CORPUS_ID");
        if (!corpusId) {
            throw new Error("Vectara corpus id is not provided.");
        }
        this.corpusId = corpusId;
        const customerId = args.customerId ?? (0, env_js_1.getEnvironmentVariable)("VECTARA_CUSTOMER_ID");
        if (!customerId) {
            throw new Error("Vectara customer id is not provided.");
        }
        this.customerId = customerId;
        this.verbose = args.verbose ?? false;
    }
    async getJsonHeader() {
        return {
            headers: {
                "x-api-key": this.apiKey,
                "Content-Type": "application/json",
                "customer-id": this.customerId.toString(),
            },
        };
    }
    async addVectors(_vectors, _documents) {
        throw new Error("Method not implemented. Please call addDocuments instead.");
    }
    async addDocuments(documents) {
        const headers = await this.getJsonHeader();
        let countAdded = 0;
        for (const [index, document] of documents.entries()) {
            const data = {
                customer_id: this.customerId,
                corpus_id: this.corpusId,
                document: {
                    document_id: document.metadata?.document_id ?? `${Date.now()}${index}`,
                    title: document.metadata?.title ?? "",
                    metadata_json: JSON.stringify(document.metadata ?? {}),
                    section: [
                        {
                            text: document.pageContent,
                        },
                    ],
                },
            };
            try {
                const response = await fetch(`https://${this.apiEndpoint}/v1/index`, {
                    method: "POST",
                    headers: headers?.headers,
                    body: JSON.stringify(data),
                });
                const result = await response.json();
                if (result.status?.code !== "OK" &&
                    result.status?.code !== "ALREADY_EXISTS") {
                    const error = new Error(`Vectara API returned status code ${result.code}: ${result.message}`);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    error.code = 500;
                    throw error;
                }
                else {
                    countAdded += 1;
                }
            }
            catch (e) {
                const error = new Error(`Error ${e.message} while adding document ${document}`);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                error.code = 500;
                throw error;
            }
        }
        if (this.verbose) {
            console.log(`Added ${countAdded} documents to Vectara`);
        }
    }
    async similaritySearchWithScore(query, k = 10, filter = undefined) {
        const headers = await this.getJsonHeader();
        const data = {
            query: [
                {
                    query,
                    numResults: k,
                    corpusKey: [
                        {
                            customerId: this.customerId,
                            corpusId: this.corpusId,
                            metadataFilter: filter?.filter ?? "",
                            lexicalInterpolationConfig: { lambda: filter?.lambda ?? 0.025 },
                        },
                    ],
                },
            ],
        };
        const response = await fetch(`https://${this.apiEndpoint}/v1/query`, {
            method: "POST",
            headers: headers?.headers,
            body: JSON.stringify(data),
        });
        if (response.status !== 200) {
            throw new Error(`Vectara API returned status code ${response.status}`);
        }
        const result = await response.json();
        const responses = result.responseSet[0].response;
        const documentsAndScores = responses.map((response) => [
            new document_js_1.Document({
                pageContent: response.text,
                metadata: response.metadata,
            }),
            response.score,
        ]);
        return documentsAndScores;
    }
    async similaritySearch(query, k = 10, filter = undefined) {
        const resultWithScore = await this.similaritySearchWithScore(query, k, filter);
        return resultWithScore.map((result) => result[0]);
    }
    async similaritySearchVectorWithScore(_query, _k, _filter) {
        throw new Error("Method not implemented. Please call similaritySearch or similaritySearchWithScore instead.");
    }
    static fromTexts(texts, metadatas, _embeddings, args) {
        const docs = [];
        for (let i = 0; i < texts.length; i += 1) {
            const metadata = Array.isArray(metadatas) ? metadatas[i] : metadatas;
            const newDoc = new document_js_1.Document({
                pageContent: texts[i],
                metadata,
            });
            docs.push(newDoc);
        }
        return VectaraStore.fromDocuments(docs, new fake_js_1.FakeEmbeddings(), args);
    }
    static async fromDocuments(docs, _embeddings, args) {
        const instance = new this(args);
        await instance.addDocuments(docs);
        return instance;
    }
}
exports.VectaraStore = VectaraStore;
