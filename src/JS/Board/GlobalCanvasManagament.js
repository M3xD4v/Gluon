let canvasDatabase = {
    "Global_Variables": {
        "Color" : "#FFFFFF",
        "LineWidth" : "3",
        "DrawWidth": "3"
    },
    "States": {
        "Selected": false,
        "SelectedObject": null
    }
}
function canvasWidthChange(value, type, AddValue) {
    const AdmissibleTypes = {
        "line": "LineWidth",
        "draw": "DrawWidth"
    };

    const EntryType = AdmissibleTypes[type];
    if (!EntryType) return;

    if (AddValue) {
        canvasDatabase.Global_Variables[EntryType] = Number(canvasDatabase.Global_Variables[EntryType]) + value;
    } else {
        canvasDatabase.Global_Variables[EntryType] = value;
    }

    canvasVariableUpdate();
}


function canvasColorChange(value) {
    canvasDatabase.Global_Variables.Color = value
}

function canvasVariableUpdate() {
    let CanvasDrawWidthLabel = document.getElementById("Input_LineWidth")
    let CanvasLineWidthLabel = document.getElementById("Input_DrawWidth")
    CanvasDrawWidthLabel.value = canvasDatabase.Global_Variables.DrawWidth
    CanvasLineWidthLabel.value = canvasDatabase.Global_Variables.LineWidth
}

// setInterval(() => {
//     console.log(canvasDatabase.Global_Variables)
// }, 1000);