function activateTool(toolName) {
    const toolFunctions = {
        "line": line,
        "text": text,
        "none": notool,
    };

    const tool = toolFunctions[toolName];
    if (tool) {
        tool();
    } else {
        console.log("Unknown tool");
    }
}

