/// <reference lib="dom" />

import { marked } from "marked";
import ollama, { type Message } from "ollama/browser";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
let messages_history: Message[] = [{ role: "system", content: "Answer the Question based only on the given Context." }];

interface QueryResponse {
    response: string,
    reference: {
        href: string,
        text: string;
    };
}

// @ts-ignore
window.importData = async (e: HTMLButtonElement) => {
    e.style.display = "none";
    const loading_element = document.getElementById("loading")!;
    loading_element.style.display = "flex";
    await fetch("/api/import?" + new URLSearchParams({
        data_type: (document.getElementById("select-data-type") as HTMLSelectElement).value,
        data_path: (document.getElementById("input-data-path") as HTMLInputElement).value,
    }));
    loading_element.style.display = "none";
    document.getElementById("chat-window")!.style.display = "block";
    await sleep(150);
    document.getElementById("input-message")!.focus();
};

function scrollToEnd(e: HTMLElement) {
    e.scrollTop = e.scrollHeight;
}

// @ts-ignore
window.sendMessage = async () => {
    const user_input = document.getElementById("input-message") as HTMLInputElement;
    const query = user_input.value;
    if (!query) return;
    user_input.value = "";
    const messages_window = document.getElementById("messages")!;
    messages_window.innerHTML += `<div class="user">${query}</div>`;

    const assistant_message = document.createElement("div");
    assistant_message.className = "assistant";
    assistant_message.innerHTML = `
        <label>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zap">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            Gathering data...
        </label>
    `;
    messages_window.appendChild(assistant_message);
    scrollToEnd(messages_window);

    const context = await (await fetch("/api/query?" + new URLSearchParams({ query }))).json() as QueryResponse;
    messages_history.push({ role: "user", content: `Question: ${query}\nContext: ${context.response}` });
    console.log(context.response);

    const response = await ollama.chat({
        model: "llama2-uncensored",
        messages: [{ role: "user", content: `Question: ${query}\nContext: ${context.response}` }],
        stream: true
    });
    let response_message = "";
    for await (const part of response) {
        response_message += part.message.content;
        assistant_message.innerHTML = marked.parse(response_message) as string;
        scrollToEnd(messages_window);
    }
    console.log(context.reference.href);
    assistant_message.innerHTML += `
        <br>Reference:
        <br><a onclick="openTarget('${context.reference.href}');">${context.reference.text}</a>
    `;
    scrollToEnd(messages_window);
    messages_history.push({ role: "assistant", content: response_message });
};

// @ts-ignore
window.downloadMessages = () => {
    var element = document.createElement("a");
    element.style.display = "none";
    element.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(messages_history)));
    element.setAttribute("download", "chat_history.json");
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

// @ts-ignore
window.clearMessages = () => {
    messages_history = [];
    document.getElementById("messages")!.innerHTML = "";
};

// @ts-ignore
window.openTarget = (target: string) => {
    fetch("/api/open?target=" + encodeURIComponent(target));
};