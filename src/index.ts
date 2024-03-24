import * as beerio from "beerio";
import type { TextNode } from "llamaindex";
import ollama from "ollama";
import open from "open";
import { basename } from "path";
import qdrant from "./qdrant";
import reader from "./reader";

const { models } = await ollama.list();
let options_html = "";
models.forEach(({ name }) => options_html += `<option value="${name}">${name}</option>`);

const $ = await beerio.fromFile("./site/index.html");
$("#select-model").html(options_html);

let retriever: Awaited<ReturnType<typeof qdrant>>;

Bun.serve({
    async fetch(request, server) {
        const url = new URL(request.url);
        switch (url.pathname) {
            case "/": {
                return new Response($.html(), {
                    headers: {
                        "Content-Type": "text/html"
                    }
                });
            }
            case "/api/import": {
                const data_type = url.searchParams.get("data_type")!;
                const data_path = url.searchParams.get("data_path")!;

                const documents = await reader(data_type, data_path);
                retriever = await qdrant(documents);
                return new Response();
            }
            case "/api/query": {
                const query = url.searchParams.get("query")!;
                const res = await retriever.retrieve(query);
                const node_id = res[0].node.sourceNode?.nodeId!;
                let href: string, text: string;
                if (node_id.startsWith("https://") || node_id.startsWith("http://")) {
                    href = text = node_id;
                } else {
                    href = node_id;
                    text = basename(href);
                }
                return new Response(JSON.stringify({
                    response: (res[0].node as TextNode).text,
                    reference: { href, text }
                }), { headers: { "Content-Type": "application/json", }, });
            }
            case "/api/open": {
                open(url.searchParams.get("target")!);
                return new Response();
            }
            default: return new Response(Bun.file("./site" + url.pathname));
        }
    },
    port: 3000
});

console.log("[LOG]", "serving at http://localhost:3000");