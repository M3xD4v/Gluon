function noTool() {
    clearDrawEventListeners()
    deselect();
    if (preview) {
        preview.remove();
    }
    //console.log("noTool")
    return;
}

function line() {
    changeSelectionState("off");
    clearDrawEventListeners()
    deselect();

    function handleClick(event) {
        const position = draw.point(event.clientX, event.clientY);
        if (firstPosition === null) {
            firstPosition = position;
            previewLine(position);

        } else if (secondPosition === null) {
            unregisterEventListener(findEventListener("previewLine"));
            preview.remove();
            secondPosition = position;
            execute(line_util(firstPosition, secondPosition, canvasDatabase.Global_Variables.Color, canvasDatabase.Global_Variables.LineWidth));
            firstPosition = null;
            secondPosition = null;
        }
    }

    draw.on('click', handleClick);
    registerEventListener("line_drawing", "click", handleClick);
}

function previewLine(startingPosition) {
    function handleMouseMove(event) {
        const position = draw.point(event.clientX, event.clientY);
        if (preview) {
            preview.remove();
        }
        preview = draw.line(startingPosition.x, startingPosition.y, position.x, position.y).stroke({
            width: canvasDatabase.Global_Variables.LineWidth
        });
        preview.stroke({
            color: 'lightgray'
        });
    }

    draw.on('mousemove', handleMouseMove);
    registerEventListener("previewLine", "mousemove", handleMouseMove);
}


function text() {
    changeSelectionState("off");
    clearDrawEventListeners()
    deselect();
    if (preview) {
        preview.remove();
    }

    function handleClick(event) {
        const position = draw.point(event.clientX, event.clientY);
        createMovableTextbox(position);
        resetTools();
    }
    draw.on('click', handleClick);
    registerEventListener("text_drawing", "click", handleClick);
}


function selection() {
    deselect();
    if (selectionType.length == 1 && selectionType[0] == "canvas") {
        changeSelectionState("canvas");
    } else if (selectionType.length == 1 && selectionType[0] == "text") {
        changeSelectionState("text");
    } else if (selectionType.length == 2) {
        changeSelectionState("both");
    } else if (selectionType.length == 0) {
        changeSelectionState("off");
    }


    /*
    function tgmultiselect(event) {
        toggleMultiSelect(draw.point(event.clientX, event.clientY))
    }

    draw.on('mousedown',tgmultiselect);

    function tgstop(event) {
        toggleMultiSelect()
        if (multi_select_box == null) return;
        
        let box_position = multi_select_box.bbox();
        multi_select_box.remove();
        multi_select_box = null;
        for (let i = 0; i < objectList.length; i++) {
            let object = objectList[i].object;
            let object_position = object.bbox();
            if (isBoundingBoxColliding(box_position, object_position)) {
                select_multiple(objectList[i].object)
            }
        }
    }
    draw.on('mouseup', tgstop);

    registerEventListener("selection", "mousedown", tgmultiselect);
    registerEventListener("selection", "mouseup", tgstop);
    */
}

function isBoundingBoxColliding(box1, box2) {
    if (box1.x < box2.x + box2.width && box1.x + box1.width > box2.x && box1.y < box2.y + box2.height && box1.y + box1.height > box2.y) {
        return true;
    }
}


function toggleMultiSelect(data) {
    multi_select = !multi_select;
    if (multi_select == true) {
        function multiselectfunction(event) {
            var rect;
            var pos1 = data
            if (pos1 == null) {
                return;
            }
            var pos2 = draw.point(event.clientX, event.clientY)
            var width = Math.abs(pos2.x - pos1.x);
            var height = Math.abs(pos2.y - pos1.y);

            if (multi_select_box == null) {
                rect = draw.rect(width, height).move(Math.min(pos1.x, pos2.x), Math.min(pos1.y, pos2.y));
                rect.fill("transparent");
                rect.stroke({
                    color: "black",
                    width: 2
                });
                multi_select_box = rect;
                multi_select_box = rect;
            } else {
                multi_select_box.width(width);
                multi_select_box.height(height);
                multi_select_box.move(Math.min(pos1.x, pos2.x), Math.min(pos1.y, pos2.y));
            }
        }


        draw.on('mousemove', multiselectfunction);
    } else {
        draw.off('mousemove', multiselectfunction);
    }
}

function freeDraw() {
    changeSelectionState("off");
    clearDrawEventListeners()
    deselect();
    let path = "";
    let points = [];

    let path_object;

    function initial_check(event) {
        if (event.button !== 0) {
            return;
        }
        let position = draw.point(event.clientX, event.clientY);
        path = "m " + position.x + " " + position.y;
        path_object = draw.path(path).stroke({
            width: canvasDatabase.Global_Variables.LineWidth
        });
        path_object.stroke({
            color: canvasDatabase.Global_Variables.Color
        });
        path_object.node.style.fill = "transparent";
        points.push([position.x, position.y]);
        draw_util(points, path, path_object);
        points.push([position.x + 1, position.y]);
    }

    function letGo(event) {
        if (event.button !== 0) {
            return;
        }
        path_object.remove();
        let ramerDouglasPeucker_points = ramerDouglasPeucker(points, 3.0);
        let smooth_path;
        if (smooth_free_draw == true) {
            smooth_path = catmullRomSpline(transformArray(ramerDouglasPeucker_points), 1.0);
        } else {
            smooth_path = pointsToPath(ramerDouglasPeucker_points);
        }
        let new_path = draw.path(smooth_path).stroke({
            width: canvasDatabase.Global_Variables.LineWidth
        });

        new_path.stroke({
            color: canvasDatabase.Global_Variables.Color
        });
        new_path.node.style.fill = "transparent";
        new_path.node.style.strokeLinecap = "round";

        let collission_path = draw.path(smooth_path).stroke({
            width: "4vh"
        });

        collission_path.stroke({
            color: "transparent"
        });
        collission_path.node.style.fill = "none";
        collission_path.node.style.strokeLinecap = "round";
        initFreeDraw(new_path, collission_path);

        points = [];
        path = "";
        draw.off("mousemove");

        let debug_c = false;
        if (debug_c == true) {
            for (let i = 0; i < ramerDouglasPeucker_points.length; i++) {
                const pnt = smooth_path.split(/[^\d.]+/)
                    .filter(str => str !== "")

                    .reduce((acc, val, index, array) => {
                        if (index % 2 === 0) {
                            acc.push({
                                x: parseFloat(array[index]),
                                y: parseFloat(array[index + 1])
                            });
                        }
                        return acc;
                    }, []);
                for (let j = 0; j < pnt.length; j++) {
                    draw.circle(5).center(pnt[j].x, pnt[j].y).fill("red");
                }

            }
        }
    }

    draw.on("mousedown", initial_check);
    registerEventListener("freeDraw", "mousedown", initial_check);
    draw.on("mouseup", letGo);
    registerEventListener("freeDraw", "mouseup", letGo);
}