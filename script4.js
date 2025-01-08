const fs = require("fs");
const path = require("path");
const { default: ollama } = require("ollama");

function getTasksFromDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    return files
        .filter((file) => file.endsWith(".txt") && fs.lstatSync(path.join(dirPath, file)).isFile())
        .map((file) => ({
            fileName: file.replace(".txt", ""),
            content: fs.readFileSync(path.join(dirPath, file), "utf-8"),
        }));
}

async function fetchChatResponse(taskContent) {
    try {
        const response = await ollama.chat({
            model: "llama3.2:latest",
            messages: [{ role: "user", content: taskContent }],
        });
        return response.message?.content || "No response from chatbot";
    } catch (error) {
        return "Error: Unable to fetch response";
    }
}

function ensureOutputFolderExists(baseFolderPath, category) {
    const categoryFolder = path.join(baseFolderPath, category);
    if (!fs.existsSync(categoryFolder)) {
        fs.mkdirSync(categoryFolder, { recursive: true });
    }
    return categoryFolder;
}

function writeResponseToFile(outputPath, fileIndex, content) {
    const filePath = path.join(outputPath, `response_${fileIndex + 1}.txt`);
    fs.writeFileSync(filePath, content, "utf-8");
}

async function processTasks() {
    const inputRoot = "question";
    const outputRoot = "output";
    const categoryName = process.argv[2];

    if (!categoryName) {
        console.log("Please provide a category name as an argument.");
        return;
    }

    const categoryPath = path.join(inputRoot, categoryName);
    if (!fs.existsSync(categoryPath) || !fs.lstatSync(categoryPath).isDirectory()) {
        console.log(`Category '${categoryName}' does not exist or is not a directory.`);
        return;
    }

    const tasks = getTasksFromDirectory(categoryPath);
    if (tasks.length === 0) {
        console.log(`No task files found in category '${categoryName}'.`);
        return;
    }

    const outputFolder = ensureOutputFolderExists(outputRoot, categoryName);

    for (let i = 0; i < tasks.length; i++) {
        const response = await fetchChatResponse(tasks[i].content);
        writeResponseToFile(outputFolder, i, response);
    }

    console.log("Task processing completed.");
}

processTasks();
