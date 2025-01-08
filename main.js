import fs from 'fs/promises'; 
import ollama from "ollama";

async function processQuery() {
    try {
        const q = await fs.readFile("q.txt", "utf8");

        const response = await ollama.chat({
            model: "llama3.2:1b",
            messages: [{ role: "user", content: q }],
        });

        const a = response.message.content;

        await fs.writeFile("a.txt", a);

        console.log("Response written to a.txt successfully!");
    } catch (error) {
        console.error("Error processing the query:", error);
    }
}


processQuery();