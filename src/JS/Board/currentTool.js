function activateTool(toolName) {
    const toolFunctions = {
        "text": text,
        "line": line,
        "edit": edit,
        "rectangle": rectangle,
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

