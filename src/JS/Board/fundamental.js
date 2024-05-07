function generateID(inputString) {
    let hash = CryptoJS.SHA256(inputString).toString(CryptoJS.enc.Hex);
    return hash;
}

function getMousePosition(options) {
    return canvas.getPointer(options.e)
}

function addText(x, y) {
    var text = new fabric.Textbox('Your Text Here', {
        left: x,
        top: y,
        fontSize: 20,
        fill: 'black'
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
    canvas.selection = true
    TC();
}

function addLine(pos1, pos2) {
    if (!canvas.getActiveObject()) { // Check if there isn't a target selected
        
        var line = makeLine([pos1.x, pos1.y, pos2.x, pos2.y]);
        canvas.add(line);
        canvas.selection = true
        TC();
    }
}

function makeLine(coords) {
    var ColorInput = document.getElementById('ColorI');
    return new fabric.Line(coords, {
        fill: ColorInput.value,
        stroke: ColorInput.value,
        strokeWidth: 5,
        selectable: true,
        evented: false,
        hasControls: false,
        hasBorders: false
    });
}


class ControlPoint {
    constructor(object, c1 = "empty", c2 = "empty") {
        this.object = object;
        this.c1 = c1;
        this.c2 = c2;
    }

    setContP(ContP) {
        if (this.c1 === "empty") {
            this.c1 = ContP;
        } else {
            this.c2 = ContP;
        }
    }
}


function replaceValues(ContP, line) {
    const controlPoint = InControl.find(cp => cp.object === line);
    if (controlPoint) {
        controlPoint.setContP(ContP);
    }
}


function addControlPoints(x, y, radius, line) {
    const circle = new fabric.Circle({
        radius: radius,
        stroke: "#212121",
        strokeWidth: 2,
        fill: "#636363",
        left: x,
        top: y,
        hasControls: false,
        hasBorders: false,
    });
    canvas.add(circle);
    replaceValues(circle, line);
}

function isLineInControl(line) {
    return InControl.some(cp => cp.object === line);
}


function lineControlPoints(line) {
    if (!isLineInControl(line) && line.type === "line") {
        const controlPoint = new ControlPoint(line);
        InControl.push(controlPoint);

        addControlPoints(line.x1, line.y1, 5, line);
        addControlPoints(line.x2, line.y2, 5, line);
        move(line)
    }
}

function getControlPoints(line) {
    const controlPoint = InControl.find(cp => cp.object === line);
    if (controlPoint) {
        return [controlPoint.c1, controlPoint.c2];
    }
    return [];
}

function move(line) {
    var selected = getControlPoints(line)
    let point1 = selected[0]
    let point2 = selected[1]
    point1.on('moving', function () {
        point1.bringToFront();
        line.set({
            x1: point1.left,
            y1: point1.top
        });
        line.setCoords();
        canvas.renderAll();
    });
    point2.on('moving', function () {
        point2.bringToFront();
        line.set({
            x2: point2.left,
            y2: point2.top
        });
        line.setCoords();
        canvas.renderAll();
    });
}
function getAllControlPoints() {
    const allControlPoints = [];
    InControl.forEach(cp => {
        allControlPoints.push(cp.c1, cp.c2);
    });
    return allControlPoints;
}

function deleteControlPoints(line) {
    for (let index = 0; index < getAllControlPoints().length; index++) {
        canvas.remove(getAllControlPoints()[index])
    }
    InControl = []
}

function previewRectangle(input, options) {
    previewRect = new fabric.Rect({
        left: input.x,
        top: input.y,
        width: canvas.getPointer(options.e).x - input.x,
        height: canvas.getPointer(options.e).y - input.y,
        stroke: 'black',
        fill: "#43ff6494",
        selectable: false,
        evented: false,
        strokeDashArray: [10, 10] 
    });
    previewRectGlobal = previewRect;
    canvas.add(previewRect);

    canvas.on('mouse:move', function PreviewRectFunc() {
        var pointer = canvas.getPointer(options.e);
        previewRect.set({
            width: pointer.x - input.x,
            height: pointer.y - input.y
        });
        canvas.renderAll();
        if (previewRectGlobal == undefined) canvas.off('mouse:move', PreviewRectFunc);
    });
}


function addRectangle(pos1, pos2) {
    if (!canvas.getActiveObject()) { // Check if there isn't a target selected
        var rect = makeRectangle(pos1, pos2);
        canvas.add(rect);
        canvas.selection = true;
        TC();
    }
}

function makeRectangle(pos1, pos2) {
    var ColorInput = document.getElementById('ColorI');
    return new fabric.Rect({
        left: Math.min(pos1.x, pos2.x),
        top: Math.min(pos1.y, pos2.y),
        width: Math.abs(pos1.x - pos2.x),
        height: Math.abs(pos1.y - pos2.y),
        fill: ColorInput.value,
        stroke: ColorInput.value,
        strokeWidth: 5,
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true
    });
}
