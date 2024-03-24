import {
    Ollama,
    QdrantVectorStore,
    VectorStoreIndex,
    serviceContextFromDefaults,
    type Document,
    type Metadata
} from "llamaindex";

export default async function (documents: Document<Metadata>[]) {
    const vectorStore = new QdrantVectorStore({
        url: "http://localhost:6333",
    });
    const serviceContext = serviceContextFromDefaults({
        llm: new Ollama({ model: "gemma:2b" }),
        embedModel: new Ollama({ model: "nomic-embed-text" }),
        chunkSize: 100,
        chunkOverlap: 20,
    });
    const index = await VectorStoreIndex.fromDocuments(documents, {
        vectorStore,
        serviceContext
    });
    return index.asRetriever({ similarityTopK: 1 });
}