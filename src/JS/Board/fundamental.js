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
    return new fabric.Line(coords, {
        fill: 'red',
        stroke: 'red',
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


function addControlPoints(x, y, fill, radius, line) {
    const circle = new fabric.Circle({
        radius: radius,
        fill: fill,
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

        addControlPoints(line.x1, line.y1, "black", 5, line);
        addControlPoints(line.x2, line.y2, "black", 5, line);
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
        line.set({
            x1: point1.left,
            y1: point1.top
        });
        canvas.renderAll();
    });
    point2.on('moving', function () {
        line.set({
            x2: point2.left,
            y2: point2.top
        });
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