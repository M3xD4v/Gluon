function buh() {
    console.log("")
}

function text() {
    canvas.selection = false
    canvas.on('mouse:down', function TextMDown (options) {
        if (options.target == null && GAV("tool") == "text") {
            addText(getMousePosition(options).x, getMousePosition(options).y);
            canvas.off('mouse:down', TextMDown);
        }
    });
}

function line() {
    canvas.selection = false
    canvas.on('mouse:down', function LineMDown (options) {
        if (options.target == null && GAV("tool") == "line") {
            click = click + 1
            var pointer = canvas.getPointer(options.e);
            if (startPoint == undefined) {
                startPoint = pointer;
            }
            else if (startPoint != undefined) {
                addLine(startPoint,pointer)
                canvas.off('mouse:down', LineMDown);
            }
        }
    });
}

function deleteSelected() {
    canvas.remove(...canvas.getActiveObjects());
}

function edit() {
    function checkActiveObject() {
        var activeObject = canvas.getActiveObject();
        if (activeObject) {
            console.log("There is an active object:", activeObject);
        } else {
            console.log("No active object.");
        }
    }

    IntervalArray.push(setInterval(checkActiveObject, 500));
    
}
