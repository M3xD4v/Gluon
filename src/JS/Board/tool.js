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

function previewLine(input,options) {
    previewLn = new fabric.Line([input.x, input.y, canvas.getPointer(options.e).x, canvas.getPointer(options.e).y], {
        stroke: 'black',
        selectable: false,
        evented: false,
        strokeDashArray: [10, 10] // optional: dashed line for preview
    });
    previewLineGlobal = previewLn
    canvas.add(previewLn);

    canvas.on('mouse:move', function PreviewLineFunc() {
        var pointer = canvas.getPointer(options.e);
        previewLn.set({
            x2: pointer.x,
            y2: pointer.y
        });
        canvas.renderAll();
        if (previewLineGlobal == undefined) canvas.off('mouse:move', PreviewLineFunc);
    });
}

function rectangle() {
    canvas.selection = false
    canvas.on('mouse:down', function RectMDown(options) {
        if (options.target == null && GAV("tool") == "rectangle") {
            click = click + 1
            var pointer = canvas.getPointer(options.e);
            if (startPoint == undefined) {
                startPoint = pointer;
                previewRectangle(pointer, options);
            } else if (startPoint != undefined) {
                addRectangle(startPoint, pointer);
                canvas.off('mouse:down', RectMDown);
                canvas.remove(previewRectGlobal);
                previewRectGlobal = undefined;
            }
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
                previewLine(pointer,options)
            }
            else if (startPoint != undefined) {
                addLine(startPoint,pointer)
                canvas.off('mouse:down', LineMDown);
                canvas.remove(previewLineGlobal);
                previewLineGlobal = undefined;
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
