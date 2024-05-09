let firstPosition = null;
let secondPosition = null;
let DrawEventListeners = [];
let history = [];
let pointer = -1;
let preview = null;
var line_list = [];
var is_moving = false;

function clearDrawEventListeners() {
    DrawEventListeners.forEach((listener) => {
        draw.off(listener.type, listener.func);
    });
    DrawEventListeners = [];
}

function EventListenerTrack(Event_Name, Event_Type, Event_Func) {
    let event = {
        name: Event_Name,
        type: Event_Type,
        func: Event_Func
    }
    DrawEventListeners.push(event);
}

function disableEventListener(event) {
    draw.off(event.type, event.func);
    DrawEventListeners = DrawEventListeners.filter((listener) => listener.name !== event.name);
}

function getEventListenerByName(name) {
    return DrawEventListeners.find((listener) => listener.name === name);
}


function setTool(tool) {
    if (activeTool === tool) {
        resetTools()
    } else {
        activeTool = tool;
        activateTool(tool)
    }

}

function resetTools() {
    firstPosition = null;
    secondPosition = null;
    clearDrawEventListeners();
    activateTool("none")
    activeTool = "none";
}

function exportCanvas() {
    var svg = draw.svg();
    var svgBlob = new Blob([svg], {
        type: "image/svg+xml"
    });
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "canvas.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
}

function importCanvas() {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/svg+xml";
    input.onchange = function (event) {
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function (event) {
            var svgString = event.target.result;
            draw.clear();
            draw.svg(svgString);
        };
        reader.readAsText(file);
    };
    input.click();
}


function execute(action) {
    history = history.slice(0, pointer + 1);
    action.do();
    history.push(action);
    pointer = history.length - 1;
}

function undo() {
    if (pointer >= 0) {
        history[pointer].undo();
        pointer--;
    }
}

function redo() {
    if (pointer < history.length - 1) {
        pointer++;
        history[pointer].do();
        console.log(history[pointer])
    }
}

function collission() {
    var collission_lines = document.querySelectorAll('[id=collission_line]');
    collission_lines.forEach(function (element) {
        element.style.stroke = "rgba(181, 107, 255, 0.339)";
    });
}

function start_movelinewithcollission(collission_line, line, id) {
    collission_line.on('mousemove', function linetransform(event) {
        console.log("moving " + id)
        if (state === "hold") {
            const position = draw.point(event.clientX, event.clientY);
            line.center(position.x, position.y);
            collission_line.center(position.x, position.y);
        }
    });
}

function make_line_movable(line_object) {
    let collission = line_object.collission_line;
    let line = line_object.line;
    let parentNode = line.node.parentNode;
    collission.on('mousedown', function (event) {
        state = "hold";
        console.log("hold")
        start_movelinewithcollission(collission, line, line_object.id)
        collission.node.style.cursor = "grabbing";

        collission.node.parentNode.appendChild(line_object.collission_line.node);


    })
    collission.on('mouseup', function (event) {
        state = "nohold";
        console.log("nohold")
        collission.node.style.cursor = "auto";
        collission.off('mousemove');
    })
}