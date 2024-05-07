function activateTool(toolName) {
    const toolFunctions = {
        "text": text,
        "line": line,
        "edit": edit,
        "delete": deleteSelected,
        "none": buh,
    };

    const tool = toolFunctions[toolName];
    if (tool) {
        tool();
    } else {
        console.log("Unknown tool");
    }
}

