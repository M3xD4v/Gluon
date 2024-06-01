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
var selection_type = [];

let textSelected = null;
var multi_select = false;
multi_select_box = null;
var m_selected = [];
var bbox = null;
var isTextMoving = false; let selectedText = null;

function activateTool(toolName) {
    const toolFunctions = {
        "line": line,
        "text": text,
        "draw": free_draw,
        "none": notool,
        "selection": selection
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
    hide_all_menus()
    if (activeTool === tool) {
        resetTools()
    } else {
        resetTools()
        activeTool = tool;
        activateTool(tool)
        if (tool == "line") {
            toggle_buttons("line")
        }
        if (tool == "draw") {
            toggle_buttons("draw")
        }
        if (tool == "text") {
            toggle_buttons("text")
        }
        if (tool == "selection") {
            toggle_buttons("selection")
            let buttons = document.getElementsByClassName("stbutton");

            for (let i = 0; i < buttons.length; i++) {
                if (buttons[i].classList.value.includes(tool)) {
                    buttons[i].style.display = "inline-flex";
                } else {
                    buttons[i].style.display = "none";
                }
            }

            return
        }
        let buttons = document.getElementsByClassName("stbutton");
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].classList.value.includes(tool) || buttons[i].classList.value.includes("all")) {
                buttons[i].style.display = "inline-flex";
            } else {
                buttons[i].style.display = "none";
                hide_all_menus()
            }
        }

    }

}

function resetTools(keep_selection) {
    if (keep_selection == undefined) {
        firstPosition = null;
        secondPosition = null;
        clearDrawEventListeners();
        activateTool("none")
        activeTool = "none";
        let buttons = document.getElementsByClassName("stbutton");
        let color_button = document.getElementById("color_settings");
        color_button.style.display = "none";
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].style.display = "none";
        }
        let active_buttons = document.getElementsByClassName("button_active")
        if (active_buttons.length > 0 && !active_buttons[0].classList.value.includes("selection_toggle")) {
            let img = active_buttons[0].getElementsByTagName("img")[0];
            img.style.filter = "invert(0)";
            active_buttons[0].classList.add("button");
            active_buttons[0].classList.remove("button_active");
        }
    }
}

function exportCanvas() {
    let data = [];
    for (let i = 0; i < object_list.length; i++) {
        if (object_list[i].type == "line") {
            let JSON_data = {
                object: object_list[i].object.node.outerHTML,
                collission: object_list[i].collission_object.node.outerHTML,
                type: object_list[i].type,
                color: object_list[i].color,
                smoothing: object_list[i].smoothing,
                stroke: object_list[i].object.node.attributes["stroke-width"].value
            }
            data.push(JSON_data);
        }
        if (object_list[i].type == "path") {
            let JSON_data = {
                object: object_list[i].object.node.outerHTML,
                collission: object_list[i].collission_object.node.outerHTML,
                type: object_list[i].type,
                color: object_list[i].color,
                smoothing: object_list[i].smoothing,
                stroke: object_list[i].object.node.attributes["stroke-width"].value,
                d: object_list[i].object.node.attributes.d.value,
                fill: object_list[i].object.node.style.fill
            }
            data.push(JSON_data);
        }
        if (object_list[i].type == "text") {
            let JSON_data = {
                object: object_list[i].object.outerHTML,
                type: object_list[i].type,
            }
            console.log(JSON_data)
            data.push(JSON_data);
        }
    }
    return data;
}

function line_htmlstring_to_position(object) {
    let regex = /x1="(\d+)" y1="(\d+)" x2="(\d+)" y2="(\d+)"/;
    let match = object.match(regex);

    if (match) {
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseInt(match[4])];
    }
}

function importCanvas(data) {



    draw.clear();
    object_list = [];
    resetTools();
    data = JSON.parse(data);
    for (let i = 0; i < data.length; i++) {
        if (data[i].type == "line") {
            let object = draw.line().stroke({
                color: data[i].color,
                width: data[i].stroke
            });
            let collission = draw.line().stroke({
                color: "transparent",
                width: data[i].stroke
            });

            let pos = line_htmlstring_to_position(data[i].object);
            let col_pos = line_htmlstring_to_position(data[i].collission);
            object.plot(pos[0], pos[1], pos[2], pos[3]);
            collission.plot(col_pos[0], col_pos[1], col_pos[2], col_pos[3]);

            let line = {
                object: object,
                collission_object: collission,
                type: "line",
                color: data[i].color,
                control_points: [],
                smoothing: "false",
            }
            object_list.push(line);
            enable_selection(line);
        } else if (data[i].type == "path") {
            let object = draw.path().stroke({
                color: data[i].color,
                width: data[i].stroke
            });
            let collission = draw.path().stroke({
                color: "transparent",
                width: data[i].stroke
            });


            object.node.attributes.d.value = data[i].d;
            collission.node.attributes.d.value = data[i].d;
            collission.node.style.fill = "transparent";
            object.node.style.fill = "transparent";
            object.node.style.strokeLinecap = "round";


            let line = {
                object: object,
                collission_object: collission,
                type: "path",
                color: data[i].color,
                control_points: [],
                smoothing: "false"
            }
            object_list.push(line);
            enable_selection(line);
        } else if (data[i].type == "text") {
            let object = data[i].object;
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = object;
            var newElement = tempDiv.firstChild;
            document.getElementById("drawing").appendChild(newElement);
            TextInit(newElement);
        }
    }

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

function contorl_move(line_object, control_point, num) {
    let collission = line_object.collission_object;
    let line = line_object.object;

    function control_move(event) {
        const position = draw.point(event.clientX, event.clientY);
        if (num === 1) {
            line.node.setAttribute("x1", position.x);
            line.node.setAttribute("y1", position.y);
            collission.node.setAttribute("x1", position.x);
            collission.node.setAttribute("y1", position.y);
        }
        if (num === 2) {
            line.node.setAttribute("x2", position.x);
            line.node.setAttribute("y2", position.y);
            collission.node.setAttribute("x2", position.x);
            collission.node.setAttribute("y2", position.y);
        }
        control_point.center(position.x, position.y);
    }
    draw.on('mousemove', control_move);
    add_selection_event(draw, control_move, "mousemove");

}

function line_controlpoints(line_object) {
    let line = line_object.object;
    let c1 = draw.circle(15).fill('white');
    c1.node.setAttribute("strokeWidth", "0.25vh");
    c1.node.setAttribute("stroke", "black");
    c1.node.setAttribute("r", "0.5vh");
    let c2 = draw.circle(15).fill('white');
    c2.node.setAttribute("strokeWidth", "0.25vh");
    c2.node.setAttribute("stroke", "black");
    c2.node.setAttribute("r", "0.5vh");
    let atr = line.node.attributes;
    c1.center(atr.x1.value, atr.y1.value);
    c2.center(atr.x2.value, atr.y2.value);


    c1.on('mouseover', function (event) {
        c1.fill('#FFB385');
    })
    c2.on('mouseover', function (event) {
        c2.fill('#FFB385');
    })
    c1.on('mouseout', function (event) {
        c1.fill('white');
    })
    c2.on('mouseout', function (event) {
        c2.fill('white');
    })


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
    let collision = path_object.collission_object;
    let path_points = path_array(path.node.attributes.d.value);
    let convert1 = path_points.flatMap(obj => [obj.x, obj.y])
    let smooth_path = Catmull_Rom_Spline(convert1, 1.0);
    path.node.setAttribute("d", smooth_path);
    collision.node.setAttribute("d", smooth_path);
    path_object.smoothing = "true";

}

function path_controlpoints(path_object) {
    let path = path_object.object;
    let path_points = path_array(path.node.attributes.d.value);
    let path_length = path_points.length;
    for (let i = 0; i < path_length; i++) {
        let c = draw.circle(15).fill('white');
        c.node.setAttribute("r", "0.5vh");
        c.node.setAttribute("stroke", "black");
        c.node.setAttribute("strokeWidth", "0.25vh");
        c.center(path_points[i].x, path_points[i].y);
        c.on('mousedown', function (event) {
            control_move_path(path_object, c, i)
        })
        c.on('mouseup', function (event) {
            draw.off('mousemove');
            c.off('mousemove');
            if (path_object.smoothing == "true") {
                path_smoothen(path_object);
            }
        })
        control_points.push(c);
        path_object.control_points.push(c);
        add_selection_event(c, "all");
    }
}

function update_settings_menus(object) {
    if (object == undefined) {
        let buttons = document.getElementsByClassName("stbutton");
        for (let i = 0; i < buttons.length; i++) {
            if (!buttons[i].classList.value.includes("selection")) {
                buttons[i].style.display = "none";
            }
        }
    } else if (object.type == "line") {
        let color = selected.color
        let width = selected.object.node.getAttribute("stroke-width")
        let width_value = document.getElementById("line_widthvalue");
        let color_value = document.getElementById("colorvalue");
        width_value.value = width;
        color_value.value = color;
    } else if (object.type == "path") {
        let color = selected.color
        let width = selected.object.node.getAttribute("stroke-width")
        let width_value = document.getElementById("draw_widthvalue");
        let color_value = document.getElementById("colorvalue");
        width_value.value = width;
        color_value.value = color;
        let button = document.getElementById("smoothing_toggle");
        if (object.smoothing == "false" && button.classList.contains("checkmark_active")) {
            button.classList.remove("checkmark_active");
            button.classList.add("checkmark");
        } else if (object.smoothing == "true" && button.classList.contains("checkmark")) {
            button.classList.remove("checkmark");
            button.classList.add("checkmark_active");
        }
    }
}

function select(object) {
    if (object.object.node.style.display == "none") return;
    selected = object;
    window.parent.showNotification_value("selected" + " " + object.type + " " + "object");
    update_settings_menus(object)
    selected_original_color = object.color;
    selected.object.stroke({
        color: "#ff8600"
    });
    for (let i = 0; i < object_list.length; i++) {
        if (object_list[i].type != "text") object_list[i].collission_object.off();
    }
    if (object.type === "line") {
        object.control_points = [];
        object.pivot = [];
        line_controlpoints(object);
        show_settings_buttons("line");
    }
    if (object.type === "path") {
        path_selected_snapshot = object;
        object.control_points = [];
        object.pivot = [];
        path_controlpoints(object);
        if (object.smoothing == "true") {
            path_smoothen(object)
        }
        show_settings_buttons("draw");
    }

    draw.on('dblclick', function () {
        deselect();
    });
    let color_input = document.getElementById("colorvalue");
    color_input.addEventListener("input", function () {
        selected_original_color = color_input.value;
        selected.object.stroke({
            color: color_input.value
        });
        selected.color = color_input.value;
    });
}

function select_multiple(object) {
    selected = "multiple";

    if (!m_selected.includes(object)) {
        m_selected.push(object);
    }
    let box;
    if (bbox == null) {
        let bb = get_multiple_bb();
        box = draw.rect(bb.width, bb.height).fill("transparent").stroke({
            color: "#ff8600",
            width: 1
        });
        box.move(bb.x, bb.y);
        bbox = box;

    } else {
        let bb = get_multiple_bb();
        bbox.size(bb.width, bb.height);
        bbox.move(bb.x, bb.y);
        bbox.on('click', function (evne) {
            let initial_position = draw.point(event.clientX, event.clientY);
            bbox.on('mousemove', function (event) {
                let pos = draw.point(event.clientX, event.clientY);
                bbox.center(pos.x, pos.y);
                let offset = {
                    x: pos.x - initial_position.x,
                    y: pos.y - initial_position.y
                }

                for (let i = 0; i < m_selected.length; i++) {
                    let object = m_selected[i];
                    //console.log(offset)
                    object.dmove(offset.x, offset.y);
                }
                initial_position = pos;
            });
        });
    }
}


function get_multiple_bb() {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < m_selected.length; i++) {
        let bbox = m_selected[i].bbox();
        minX = Math.min(minX, bbox.x);
        minY = Math.min(minY, bbox.y);
        maxX = Math.max(maxX, bbox.x2);
        maxY = Math.max(maxY, bbox.y2);
    }
    let width = maxX - minX;
    let height = maxY - minY;
    return {
        x: minX,
        y: minY,
        width: width,
        height: height
    };

}


function deselect(global) {
    if (selected == "multiple") {
        selected = null;
        m_selected = [];
        bbox.remove();
        bbox = null;
        
    } else if (selected && selected != "multiple") {
        selected.object.stroke({
            color: selected_original_color
        });
        selected = null;
        disable_all_object_events();
        hide_all_menus();
        delete_controlpoints()
        update_settings_menus();
        if (global == undefined) {
            window.parent.showNotification_value("deselected");
            draw.off('dblclick');
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
    if (object_element.type === "line" && selected == null) {
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
    if (object_element.type === "path" && selected == null) {
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
        resetTools("keep_selection")
        let movableBox = document.getElementsByClassName('textbox');
        for (let i = 0; i < movableBox.length; i++) {
            movableBox[i].style.pointerEvents = "none";
        }
        for (let i = 0; i < object_list.length; i++) {
            enable_selection(object_list[i])
        }
    }
    if (newstate === "text") {
        let movableBox = document.getElementsByClassName('textbox');
        disable_all_object_events();
        deselect("global");
        resetTools("keep_selection")
        for (let i = 0; i < movableBox.length; i++) {
            movableBox[i].style.pointerEvents = "auto";
        }
    }
    if (newstate === "off") {
        let movableBox = document.getElementsByClassName('textbox');
        disable_all_object_events()
        for (let i = 0; i < movableBox.length; i++) {
            movableBox[i].style.pointerEvents = "none";
        }
    }
    if (newstate === "both") {
        let movableBox = document.getElementsByClassName('textbox');
        for (let i = 0; i < movableBox.length; i++) {
            movableBox[i].style.pointerEvents = "auto";
        }
        for (let i = 0; i < object_list.length; i++) {
            enable_selection(object_list[i])
        }

    }
}

function toggle_selection(type) {
    if (type == "canvas" && !selection_type.includes("canvas")) {
        toggle_button_by_id("canvas_selection")
        selection_type.push("canvas");
    } else if (type == "canvas" && selection_type.includes("canvas")) {
        toggle_button_by_id("canvas_selection")
        selection_type = selection_type.filter(e => e !== "canvas");
    }
    if (type == "text" && !selection_type.includes("text")) {
        toggle_button_by_id("text_selection")
        selection_type.push("text");
    } else if (type == "text" && selection_type.includes("text")) {
        toggle_button_by_id("text_selection")
        selection_type = selection_type.filter(e => e !== "text");
    }
    selection();
}


let delete_click_count = 0;

function delete_selected() {
    if (delete_click_count == 0 && selected != null) {
        window.parent.showNotification("double click for confirmation", 0);
        delete_click_count = 1;
    } else if (delete_click_count == 1 && selected != null) {
        delete_click_count = 0;
        let index = object_list.indexOf(selected);
        object_list.splice(index, 1);
        selected.object.remove();
        selected.collission_object.remove();
        deselect();
        selected = null;
        resetTools("keep_selection");
        delete_click_count = 0;
    }
}