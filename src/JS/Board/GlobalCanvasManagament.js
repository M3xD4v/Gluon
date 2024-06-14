let CanvasDatabase = {
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
function Canvas_HandleWidthChange(value, type, AddValue) {
    const AdmissibleTypes = {
        "line": "LineWidth",
        "draw": "DrawWidth"
    };

    const EntryType = AdmissibleTypes[type];
    if (!EntryType) return;

    if (AddValue) {
        CanvasDatabase.Global_Variables[EntryType] = Number(CanvasDatabase.Global_Variables[EntryType]) + value;
    } else {
        CanvasDatabase.Global_Variables[EntryType] = value;
    }

    Canvas_UpdateGlobalVariables();
}


function Canvas_HandleColorChange(value) {
    CanvasDatabase.Global_Variables.Color = value
}

function Canvas_UpdateGlobalVariables() {
    let CanvasDrawWidthLabel = document.getElementById("Input_LineWidth")
    let CanvasLineWidthLabel = document.getElementById("Input_DrawWidth")
    CanvasDrawWidthLabel.value = CanvasDatabase.Global_Variables.DrawWidth
    CanvasLineWidthLabel.value = CanvasDatabase.Global_Variables.LineWidth
}

setInterval(() => {
    console.log(CanvasDatabase.Global_Variables)
}, 1000);