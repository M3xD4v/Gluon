let firstPosition = null;
let secondPosition = null;
var DrawEventListeners = [];
let history = [];
let pointer = -1;
let preview = null;
var object_list = [];
var is_moving = false;
var selected = null;
var selected_original_color = null;
let selection_event_objects = [];
let control_points = [];
var path_selected_snapshot;

function activateTool(toolName) {
    const toolFunctions = {
        "line": line,
        "text": text,
        "draw": free_draw,
        "none": notool,
    };

    const tool = toolFunctions[toolName];
    if (tool) {
        tool();
    } else {
        console.log("Unknown tool");
    }
}

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

function add_selection_event(object, name, type) {
    let event = {
        object: object,
        name: name,
        type: type
    }

    selection_event_objects.push(event);
}

function start_movelinewithcollission(object, pivot) {
    let collission_line = object.collission_object;
    let line = object.object;

    function linetransform(event) {
        if (state === "hold") {
            const position = draw.point(event.clientX, event.clientY);
            line.center(position.x, position.y);
            collission_line.center(position.x, position.y);
            pivot.center(position.x, position.y);

            object.control_points[0].center(line.node.attributes.x1.value, line.node.attributes.y1.value);
            object.control_points[1].center(line.node.attributes.x2.value, line.node.attributes.y2.value);

        }
    }

    draw.on('mousemove', linetransform);
    add_selection_event(draw, linetransform, "mousemove");
}

function make_line_movable(line_object) {
    let line = line_object.object;
    let parentNode = line.node.parentNode;

    let circle = draw.circle(15).fill('gray');
    let center = line.bbox();
    circle.center(center.cx, center.cy);

    circle.on('mousedown', function (event) {
        state = "hold";
        start_movelinewithcollission(line_object, circle)
        circle.node.style.cursor = "grabbing";
        parentNode.appendChild(circle.node);
    })
    circle.on('mouseup', function (event) {
        state = "nohold";
        circle.node.style.cursor = "auto";
        circle.off('mousemove');
    })
    add_selection_event(circle, "all");
    control_points.push(circle);
    line_object.pivot.push(circle);
}

function contorl_move(line_object, control_point, num) {
    let collission = line_object.collission_object;
    let line = line_object.object;
    let move_pivot = line_object.pivot[0];

    function control_move(event) {
        const position = draw.point(event.clientX, event.clientY);
        if (num === 1) {
            line.node.setAttribute("x1", position.x);
            line.node.setAttribute("y1", position.y);
            collission.node.setAttribute("x1", position.x);
            collission.node.setAttribute("y1", position.y);
            let inbetween = collission.bbox();
            move_pivot.center(inbetween.cx, inbetween.cy);
        }
        if (num === 2) {
            line.node.setAttribute("x2", position.x);
            line.node.setAttribute("y2", position.y);
            collission.node.setAttribute("x2", position.x);
            collission.node.setAttribute("y2", position.y);
            let inbetween = collission.bbox();
            move_pivot.center(inbetween.cx, inbetween.cy);
        }
        control_point.center(position.x, position.y);
    }
    draw.on('mousemove', control_move);
    add_selection_event(draw, control_move, "mousemove");

}

function line_controlpoints(line_object) {
    let line = line_object.object;
    let c1 = draw.circle(15).fill('#ff7171');
    let c2 = draw.circle(15).fill('#ff7171');
    let atr = line.node.attributes;
    c1.center(atr.x1.value, atr.y1.value);
    c2.center(atr.x2.value, atr.y2.value);



    c1.on('mousedown', function (event) {
        contorl_move(line_object, c1, 1)
    })
    c1.on('mouseup', function (event) {
        draw.off('mousemove');
        c1.off('mousemove');
    })
    c2.on('mousedown', function (event) {
        contorl_move(line_object, c2, 2)
    })
    c2.on('mouseup', function (event) {
        draw.off('mousemove');
        c2.off('mousemove');
    })
    control_points.push(c1);
    control_points.push(c2);
    add_selection_event(c1, "all");
    add_selection_event(c2, "all");
    line_object.control_points.push(c1);
    line_object.control_points.push(c2);
}

function start_movelinewithcollission(object, pivot) {
    let collission_line = object.collission_object;
    let line = object.object;

    function linetransform(event) {
        if (state === "hold") {
            const position = draw.point(event.clientX, event.clientY);
            line.center(position.x, position.y);
            collission_line.center(position.x, position.y);
            pivot.center(position.x, position.y);

            object.control_points[0].center(line.node.attributes.x1.value, line.node.attributes.y1.value);
            object.control_points[1].center(line.node.attributes.x2.value, line.node.attributes.y2.value);

        }
    }

    draw.on('mousemove', linetransform);
    add_selection_event(draw, linetransform, "mousemove");
}

function start_movepathwithcollission(object, pivot) {
    function pathtransform(event) {
        if (state === "hold") {
            let collission_line = path_selected_snapshot.collission_object;
            let line = path_selected_snapshot.object;
            const position = draw.point(event.clientX, event.clientY);

            line.center(position.x, position.y);
            collission_line.center(position.x, position.y);
            pivot.center(position.x, position.y);

            for (let i = 0; i < path_selected_snapshot.control_points.length; i++) {
                let path_points = path_array(line.node.attributes.d.value);
                path_selected_snapshot.control_points[i].center(path_points[i].x, path_points[i].y);
            }

        }
    }

    draw.on('mousemove', pathtransform);
    add_selection_event(draw, pathtransform, "mousemove");
    EventListenerTrack("movepath", "mousemove", pathtransform);
}

function make_path_movable(path_object) {
    let path = path_object.object;
    let parentNode = path.node.parentNode;
    let circle = draw.circle(15).fill('gray');
    let center = path.bbox();
    circle.center(center.cx, center.cy);
    circle.on('mousedown', function (event) {
        state = "hold";
        start_movepathwithcollission(path_object, circle)
        circle.node.style.cursor = "grabbing";
        parentNode.appendChild(circle.node);
    })
    circle.on('mouseup', function (event) {
        state = "nohold";
        circle.node.style.cursor = "auto";
        circle.off('mousemove');
        disableEventListener(getEventListenerByName("movepath"));
    })
    
    add_selection_event(circle, "all");
    path_object.pivot.push(circle);
    control_points.push(circle);

}
function control_move_path(path_object, control_point, num) {
    let path = path_object.object;
    let collision = path_object.collission_object;
    let path_points = path_array(path.node.attributes.d.value);
    function control_move(event) {
        const position = draw.point(event.clientX, event.clientY);
        path_points[num].x = position.x;
        path_points[num].y = position.y;
        let new_path = points_to_path(path_points.map(point => [point.x, point.y]));
        control_point.center(position.x, position.y);
        path.node.setAttribute("d", new_path);
        collision.node.setAttribute("d", new_path);
        path_selected_snapshot = path_object;
        //path_object.pivot[0].center(path.bbox().cx, path.bbox().cy);

    }

    draw.on('mousemove', control_move);
    add_selection_event(draw, control_move, "mousemove");


}
function path_smoothen(path_object) {
    let path = path_object.object;
    let path_points = path_array(path.node.attributes.d.value);
    let smooth_button = draw.circle(15).fill('green');
    let center = path.bbox();
    smooth_button.center(center.cx + 100, center.cy);
    function smoothen_path(event) {
        let path = path_object.object;
        let collision = path_object.collission_object;
        let path_points = path_array(path.node.attributes.d.value);
        let convert1 = path_points.flatMap(obj => [obj.x, obj.y])
        let smooth_path = Catmull_Rom_Spline(convert1, 1.0);
        path.node.setAttribute("d", smooth_path);
        collision.node.setAttribute("d", smooth_path);
        
        
    }
    smooth_button.on('click', smoothen_path);
    add_selection_event(smooth_button, "all");
    control_points.push(smooth_button);
}

function path_controlpoints(path_object) {
    let path = path_object.object;
    let path_points = path_array(path.node.attributes.d.value);
    let path_length = path_points.length;
    for (let i = 0; i < path_length; i++) {
        let c = draw.circle(15).fill('#2f2f2f40');
        c.center(path_points[i].x, path_points[i].y);
        c.on('mousedown', function (event) {
            control_move_path(path_object, c, i)
        })
        c.on('mouseup', function (event) {
            draw.off('mousemove');
            c.off('mousemove');
        })
        control_points.push(c);
        path_object.control_points.push(c);
        add_selection_event(c, "all");
    }

}
function select(object) {
    selected = object;
    selected_original_color = object.color;
    selected.object.stroke({
        color: "#ff8600"
    });
    for (let i = 0; i < object_list.length; i++) {
        object_list[i].collission_object.off();
    }
    if (object.type === "line") {
        object.control_points = [];
        object.pivot = [];
        make_line_movable(object);
        line_controlpoints(object);
    }
    if (object.type === "path") {
        path_selected_snapshot = object;
        object.control_points = [];
        object.pivot = [];
        //make_path_movable(object);
        path_controlpoints(object);
        path_smoothen(object);
    }
}

function deselect(global) {
    if (selected) {
        selected.object.stroke({
            color: selected_original_color
        });
        console.log(global)
        selected = null;

        disable_all_object_events();

        delete_controlpoints()

        if (global == undefined) {
            for (let i = 0; i < object_list.length; i++) {
                enable_selection(object_list[i]);
            }
        }
    } else {
        console.log("selected is not valid");
    }
}

function delete_controlpoints() {
    for (let i = 0; i < control_points.length; i++) {
        control_points[i].remove();
    }
}

function disable_all_object_events() {
    let obj = selection_event_objects
    for (let i = 0; i < obj.length; i++) {
        if (obj[i].name == "all") {
            obj[i].object.off();
        } else {
            obj[i].object.off(obj[i].type, obj[i].name);
        }
    }
}

function enable_selection(object_element) {
    if (object_element.type === "line" && selected == null && activeTool == "none") {
        let collision = object_element.collission_object;
        let object = object_element.object;
        let color = object.node.attributes.stroke.value
        collision.on("mouseover", function () {
            object.stroke({
                color: "red"
            });
        });
        collision.on("mouseout", function () {
            object.stroke({
                color: color
            });
        });
        collision.on("click", function click() {
            select(object_element)
        })
        add_selection_event(collision, "all");
    }
    if (object_element.type === "path" && selected == null && activeTool == "none") {
        let collision = object_element.collission_object;
        let object = object_element.object;
        let color = object.node.attributes.stroke.value
        collision.on("mouseover", function () {
            object.stroke({
                color: "red"
            });
        });
        collision.on("mouseout", function () {
            object.stroke({
                color: color
            });
        });
        collision.on("click", function click() {
            select(object_element)
        })
        add_selection_event(collision, "all");
    }
}

function change_selection_state(newstate) {
    selection_state = newstate;
    if (newstate === "canvas") {
        let movableBox = document.getElementsByClassName('movableBox');
        for (let i = 0; i < movableBox.length; i++) {
            movableBox[i].style.pointerEvents = "none";
        }
        for (let i = 0; i < object_list.length; i++) {
            enable_selection(object_list[i])
        }
    }
    if (newstate === "text") {
        let movableBox = document.getElementsByClassName('movableBox');
        disable_all_object_events();
        deselect("global");
        for (let i = 0; i < movableBox.length; i++) {
            movableBox[i].style.pointerEvents = "auto";
        }
    }
    if (newstate === "off") {
        let movableBox = document.getElementsByClassName('movableBox');
        disable_all_object_events()
        for (let i = 0; i < movableBox.length; i++) {
            movableBox[i].style.pointerEvents = "none";
        }
    }
}
