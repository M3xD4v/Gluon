// Drawing state
let firstPosition = null;
let secondPosition = null;
let preview = null;

// Event listeners
let DrawEventListeners = [];

// History and undo/redo
let history = [];
let pointer = -1;
// Objects

let objectList = [];
let selectionEventObjects = [];
let controlPoints = [];
let pathSelectedSnapshot = null;
let selectionType = [];


// Selection
let isMoving = false;
let selected = null;
let selected_original_color = null;
let multi_select = false;
let multi_select_box = null;
let multipleSelectedArray = [];
let bbox = null;

// Text selection
let textSelected = null;
let isTextMoving = false;
let selectedText = null;


let deleteClickCount = 0;

function activateTool(toolName) {
    const tools = {
      line,
      text,
      draw: freeDraw,
      none: noTool,
      selection,
    };
  
    const tool = tools[toolName];
    if (tool) {
      tool();
    } else {
      console.log("Unknown tool");
    }
  }
  
  function clearDrawEventListeners() {
    DrawEventListeners.forEach(listener => draw.off(listener.type, listener.func));
    DrawEventListeners = [];
  }
function registerEventListener(eventName, eventType, eventFunc) {
    let event = {
        name: eventName,
        type: eventType,
        func: eventFunc
    }
    DrawEventListeners.push(event);
}

function unregisterEventListener(event) {
    draw.off(event.type, event.func);
    DrawEventListeners = DrawEventListeners.filter((listener) => listener.name !== event.name);
}

function findEventListener(name) {
    return DrawEventListeners.find(listener => listener.name === name);
}


function setTool(tool) {
    hide_all_menus();

    if (activeTool === tool) {
        resetTools();
        return;
    }

    resetTools();
    activeTool = tool;
    activateTool(tool);

    // Show relevant tool buttons
    const buttons = document.getElementsByClassName("stbutton");
    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        if (button.classList.value.includes(tool) || button.classList.value.includes("all")) {
            button.style.display = "inline-flex";
        } else if (button.classList.value.includes("selection")) {
            // Special case for selection tool
            button.style.display = "inline-flex";
        } else {
            button.style.display = "none";
        }
    }

    // Special case for selection tool (show relevant buttons)
    if (tool === "selection") {
        toggle_buttons("selection");
    } else {
        // Hide all menus except for the selection menu
        hide_all_menus();
    }
}


function resetTools(keepSelection = false) {
    if (!keepSelection) {
      // Reset drawing state
      firstPosition = null;
      secondPosition = null;
  
      // Clear event listeners
      clearDrawEventListeners();
  
      // Deactivate current tool
      activateTool("none");
      activeTool = "none";
  
      // Hide all tool buttons
      const buttons = document.getElementsByClassName("stbutton");
      for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.display = "none";
      }
  
      // Hide color settings button
      const colorButton = document.getElementById("color_settings");
      colorButton.style.display = "none";
  
      // Reset active button appearance
      const activeButtons = document.getElementsByClassName("button_active");
      for (let i = 0; i < activeButtons.length; i++) {
        const button = activeButtons[i];
        if (!button.classList.value.includes("selection_toggle")) {
          const img = button.getElementsByTagName("img")[0];
          img.style.filter = "invert(0)";
          button.classList.remove("button_active");
          button.classList.add("button");
        }
      }
    }
  }

function exportCanvas() {
  const data = [];

  for (let i = 0; i < objectList.length; i++) {
    const object = objectList[i];

    let jsonData = {
      type: object.type,
      color: object.color,
      smoothing: object.smoothing,
      stroke: object.object.node.attributes["stroke-width"].value,
    };

    if (object.type === "line" || object.type === "path") {
      jsonData.object = object.object.node.outerHTML;
      jsonData.collission = object.collission_object.node.outerHTML;
      if (object.type === "path") {
        jsonData.d = object.object.node.attributes.d.value;
        jsonData.fill = object.object.node.style.fill;
      }
    } else if (object.type === "text") {
      jsonData.object = object.object.outerHTML;
    }

    data.push(jsonData);
  }

  return data;
}

function lineHtmlToPosition(object) {
    const regex = /x1="(\d+)" y1="(\d+)" x2="(\d+)" y2="(\d+)"/;
    const match = object.match(regex);
  
    if (match) {
      return [
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3]),
        parseInt(match[4]),
      ];
    }
    return null; // Return null if no match is found
  }

  function importCanvas(data) {
    draw.clear();
    objectList = [];
    resetTools();
  
    // Parse the data if it's a string
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
  
    for (let i = 0; i < data.length; i++) {
      const objectData = data[i];
  
      if (objectData.type === "line") {
        const object = draw.line().stroke({
          color: objectData.color,
          width: objectData.stroke,
        });
        const collission = draw.line().stroke({
          color: "transparent",
          width: objectData.stroke,
        });
  
        const pos = lineHtmlToPosition(objectData.object);
        const colPos = lineHtmlToPosition(objectData.collission);
  
        object.plot(pos[0], pos[1], pos[2], pos[3]);
        collission.plot(colPos[0], colPos[1], colPos[2], colPos[3]);
  
        const line = {
          object,
          collission_object: collission,
          type: "line",
          color: objectData.color,
          controlPoints: [],
          smoothing: "false",
        };
        objectList.push(line);
        enableSelection(line);
  
      } else if (objectData.type === "path") {
        const object = draw.path().stroke({
          color: objectData.color,
          width: objectData.stroke,
        });
        const collission = draw.path().stroke({
          color: "transparent",
          width: objectData.stroke,
        });
  
        object.node.attributes.d.value = objectData.d;
        collission.node.attributes.d.value = objectData.d;
        collission.node.style.fill = "transparent";
        object.node.style.fill = "transparent";
        object.node.style.strokeLinecap = "round";
  
        const line = {
          object,
          collission_object: collission,
          type: "path",
          color: objectData.color,
          controlPoints: [],
          smoothing: "false",
        };
        objectList.push(line);
        enableSelection(line);
  
      } else if (objectData.type === "text") {
        const object = objectData.object;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = object;
        const newElement = tempDiv.firstChild;
        document.getElementById("drawing").appendChild(newElement);
        initiateText(newElement);
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

function registerSelectionEvent(object, name, type) {
    const event = {
      object,
      name,
      type,
    };
  
    selectionEventObjects.push(event);
  }

  function startMoveLineWithCollision(object, pivot) {
    const collisionLine = object.collission_object;
    const line = object.object;
  
    function lineTransform(event) {
      if (state === "hold") {
        const position = draw.point(event.clientX, event.clientY);
        line.center(position.x, position.y);
        collisionLine.center(position.x, position.y);
        pivot.center(position.x, position.y);
  
        object.controlPoints[0].center(
          line.node.attributes.x1.value,
          line.node.attributes.y1.value
        );
        object.controlPoints[1].center(
          line.node.attributes.x2.value,
          line.node.attributes.y2.value
        );
      }
    }
  
    draw.on("mousemove", lineTransform);
    registerSelectionEvent(draw, lineTransform, "mousemove");
  }
  function controlMove(lineObject, controlPoint, num) {
    const collision = lineObject.collission_object;
    const line = lineObject.object;
  
    function controlMoveHandler(event) {
      const position = draw.point(event.clientX, event.clientY);
      if (num === 1) {
        line.node.setAttribute("x1", position.x);
        line.node.setAttribute("y1", position.y);
        collision.node.setAttribute("x1", position.x);
        collision.node.setAttribute("y1", position.y);
      } else if (num === 2) {
        line.node.setAttribute("x2", position.x);
        line.node.setAttribute("y2", position.y);
        collision.node.setAttribute("x2", position.x);
        collision.node.setAttribute("y2", position.y);
      }
      controlPoint.center(position.x, position.y);
    }
  
    draw.on("mousemove", controlMoveHandler);
    registerSelectionEvent(draw, controlMoveHandler, "mousemove");
  }

  function lineControlPoints(lineObject) {
    const line = lineObject.object;
    const c1 = draw.circle(15).fill("white");
    c1.node.setAttribute("strokeWidth", "0.25vh");
    c1.node.setAttribute("stroke", "black");
    c1.node.setAttribute("r", "0.5vh");
    const c2 = draw.circle(15).fill("white");
    c2.node.setAttribute("strokeWidth", "0.25vh");
    c2.node.setAttribute("stroke", "black");
    c2.node.setAttribute("r", "0.5vh");
    const atr = line.node.attributes;
    c1.center(atr.x1.value, atr.y1.value);
    c2.center(atr.x2.value, atr.y2.value);
  
    // Mouse events for control points
    c1.on("mouseover", () => c1.fill("#FFB385"));
    c2.on("mouseover", () => c2.fill("#FFB385"));
    c1.on("mouseout", () => c1.fill("white"));
    c2.on("mouseout", () => c2.fill("white"));
  
    c1.on("mousedown", () => controlMove(lineObject, c1, 1));
    c1.on("mouseup", () => {
      draw.off("mousemove");
      c1.off("mousemove");
    });
    c2.on("mousedown", () => controlMove(lineObject, c2, 2));
    c2.on("mouseup", () => {
      draw.off("mousemove");
      c2.off("mousemove");
    });
  
    // Store control points and register events
    controlPoints.push(c1);
    controlPoints.push(c2);
    registerSelectionEvent(c1, "all");
    registerSelectionEvent(c2, "all");
    lineObject.controlPoints.push(c1);
    lineObject.controlPoints.push(c2);
  }


function controlMovePath(pathObject, controlPoint, num) {
  const path = pathObject.object;
  const collision = pathObject.collission_object;
  const pathPoints = pathArray(path.node.attributes.d.value);

  function controlMoveHandler(event) {
    const position = draw.point(event.clientX, event.clientY);
    pathPoints[num].x = position.x;
    pathPoints[num].y = position.y;
    const newPath = pointsToPath(pathPoints.map((point) => [point.x, point.y]));
    controlPoint.center(position.x, position.y);
    path.node.setAttribute("d", newPath);
    collision.node.setAttribute("d", newPath);
    pathSelectedSnapshot = pathObject;
    //path_object.pivot[0].center(path.bbox().cx, path.bbox().cy);
  }

  draw.on("mousemove", controlMoveHandler);
  registerSelectionEvent(draw, controlMoveHandler, "mousemove");
}

function pathSmoothen(pathObject) {
    const path = pathObject.object;
    const collision = pathObject.collission_object;
    const pathPoints = pathArray(path.node.attributes.d.value);
    const convert1 = pathPoints.flatMap((obj) => [obj.x, obj.y]);
    const smoothPath = catmullRomSpline(convert1, 1.0);
    path.node.setAttribute("d", smoothPath);
    collision.node.setAttribute("d", smoothPath);
    pathObject.smoothing = "true";
  }

  function pathControlPoints(pathObject) {
    const path = pathObject.object;
    const pathPoints = pathArray(path.node.attributes.d.value);
    const pathLength = pathPoints.length;
    for (let i = 0; i < pathLength; i++) {
      const c = draw.circle(15).fill("white");
      c.node.setAttribute("r", "0.5vh");
      c.node.setAttribute("stroke", "black");
      c.node.setAttribute("strokeWidth", "0.25vh");
      c.center(pathPoints[i].x, pathPoints[i].y);
  
      c.on("mousedown", () => controlMovePath(pathObject, c, i));
      c.on("mouseup", () => {
        draw.off("mousemove");
        c.off("mousemove");
        if (pathObject.smoothing === "true") {
          pathSmoothen(pathObject);
        }
      });
  
      controlPoints.push(c);
      pathObject.controlPoints.push(c);
      registerSelectionEvent(c, "all");
    }
  }

function update_settings_menus(object) {
    return
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
        let width_value = document.getElementById("Input_LineWidth");
        let color_value = document.getElementById("colorvalue");
        width_value.value = width;
        color_value.value = color;
    } else if (object.type == "path") {
        let color = selected.color
        let width = selected.object.node.getAttribute("stroke-width")
        let width_value = document.getElementById("Input_DrawWidth");
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
    window.parent.showNotificationValue("selected" + " " + object.type + " " + "object");
    update_settings_menus(object)
    selected_original_color = object.color;
    selected.object.stroke({
        color: "#ff8600"
    });
    for (let i = 0; i < objectList.length; i++) {
        if (objectList[i].type != "text") objectList[i].collission_object.off();
    }
    if (object.type === "line") {
        object.controlPoints = [];
        object.pivot = [];
        lineControlPoints(object);
        show_settings_buttons("line");
    }
    if (object.type === "path") {
        pathSelectedSnapshot = object;
        object.controlPoints = [];
        object.pivot = [];
        pathControlPoints(object);
        if (object.smoothing == "true") {
            pathSmoothen(object)
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

    if (!multipleSelectedArray.includes(object)) {
        multipleSelectedArray.push(object);
    }
    let box;
    if (bbox == null) {
        let bb = getMultipleBoundingBox();
        box = draw.rect(bb.width, bb.height).fill("transparent").stroke({
            color: "#ff8600",
            width: 1
        });
        box.move(bb.x, bb.y);
        bbox = box;

    } else {
        let bb = getMultipleBoundingBox();
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

                for (let i = 0; i < multipleSelectedArray.length; i++) {
                    let object = multipleSelectedArray[i];
                    //console.log(offset)
                    object.dmove(offset.x, offset.y);
                }
                initial_position = pos;
            });
        });
    }
}


function getMultipleBoundingBox() {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
  
    for (let i = 0; i < multipleSelectedArray.length; i++) {
      const bbox = multipleSelectedArray[i].bbox();
      minX = Math.min(minX, bbox.x);
      minY = Math.min(minY, bbox.y);
      maxX = Math.max(maxX, bbox.x2);
      maxY = Math.max(maxY, bbox.y2);
    }
  
    const width = maxX - minX;
    const height = maxY - minY;
  
    return {
      x: minX,
      y: minY,
      width,
      height,
    };
  }


function deselect(global) {
    if (selected == "multiple") {
        selected = null;
        multipleSelectedArray = [];
        bbox.remove();
        bbox = null;

    } else if (selected && selected != "multiple") {
        selected.object.stroke({
            color: selected_original_color
        });
        selected = null;
        disableAllObjectEvents();
        hide_all_menus();
        deleteControlPoints()
        update_settings_menus();
        if (global == undefined) {
            window.parent.showNotificationValue("deselected");
            draw.off('dblclick');
            for (let i = 0; i < objectList.length; i++) {
                enableSelection(objectList[i]);
            }
        }
    } else {
        //console.log("selected is not valid");
        return;
    }
}

function deleteControlPoints() {
  for (let i = 0; i < controlPoints.length; i++) {
    controlPoints[i].remove();
  }
  controlPoints = []; // Clear the array after removing elements
}

function disableAllObjectEvents() {
    const events = selectionEventObjects;
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (event.name === "all") {
        event.object.off();
      } else {
        event.object.off(event.type, event.name);
      }
    }
    selectionEventObjects = []; // Clear the array after disabling events
  }

function enableSelection(objectElement) {
  if (objectElement.type === "line" || objectElement.type === "path") {
    if (selected === null) {
      const collision = objectElement.collission_object;
      const object = objectElement.object;
      const originalColor = object.node.attributes.stroke.value;

      collision.on("mouseover", () => {
        object.stroke({ color: "red" });
      });
      collision.on("mouseout", () => {
        object.stroke({ color: originalColor });
      });
      collision.on("click", () => {
        select(objectElement);
      });
      registerSelectionEvent(collision, "all");
    }
  }
}

function changeSelectionState(newState) {
    selectionState = newState;
    const movableBoxes = document.getElementsByClassName('textbox');
  
    if (newState === "canvas") {
      resetTools("keep_selection");
  
      for (let i = 0; i < movableBoxes.length; i++) {
        movableBoxes[i].style.pointerEvents = "none";
      }
      for (let i = 0; i < objectList.length; i++) {
        enableSelection(objectList[i]);
      }
  
    } else if (newState === "text") {
      disableAllObjectEvents();
      deselect("global");
      resetTools("keep_selection");
      for (let i = 0; i < movableBoxes.length; i++) {
        movableBoxes[i].style.pointerEvents = "auto";
      }
  
    } else if (newState === "off") {
      disableAllObjectEvents();
      for (let i = 0; i < movableBoxes.length; i++) {
        movableBoxes[i].style.pointerEvents = "none";
      }
  
    } else if (newState === "both") {
      for (let i = 0; i < movableBoxes.length; i++) {
        movableBoxes[i].style.pointerEvents = "auto";
      }
      for (let i = 0; i < objectList.length; i++) {
        enableSelection(objectList[i]);
      }
    }
  }

  function toggleSelection(type) {
    if (type === "canvas") {
        toggleButtonById("canvas_selection");
      if (selectionType.includes("canvas")) {
        selectionType = selectionType.filter((e) => e !== "canvas");
      } else {
        selectionType.push("canvas");
      }
    } else if (type === "text") {
        toggleButtonById("text_selection");
      if (selectionType.includes("text")) {
        selectionType = selectionType.filter((e) => e !== "text");
      } else {
        selectionType.push("text");
      }
    }
    selection();
  }


function deleteSelected() {
    if (deleteClickCount === 0 && selected != null) {
      window.parent.showNotification("double click for confirmation", 0);
      deleteClickCount = 1;
    } else if (deleteClickCount === 1 && selected != null) {
      deleteClickCount = 0;
      const index = objectList.indexOf(selected);
      objectList.splice(index, 1);
      selected.object.remove();
      selected.collission_object.remove();
      deselect();
      selected = null;
      resetTools("keep_selection");
    }
  }