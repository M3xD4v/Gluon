function notool() {
    clearDrawEventListeners()
    deselect();
    if (preview) {
        preview.remove();
    }
    console.log("notool")
}

function line() {
    change_selection_state("off");
    clearDrawEventListeners()
    deselect();

    function handleClick(event) {
        const position = draw.point(event.clientX, event.clientY);
        if (firstPosition === null) {
            firstPosition = position;
            previewLine(position);

        } else if (secondPosition === null) {
            disableEventListener(getEventListenerByName("previewLine"));
            preview.remove();
            secondPosition = position;
            execute(line_f(firstPosition, secondPosition, getColor(), getWidth("line")));
            firstPosition = null;
            secondPosition = null;
        }
    }

    draw.on('click', handleClick);
    EventListenerTrack("line_drawing", "click", handleClick);
}

function previewLine(startingPosition) {
    function handleMouseMove(event) {
        const position = draw.point(event.clientX, event.clientY);
        if (preview) {
            preview.remove();
        }
        preview = draw.line(startingPosition.x, startingPosition.y, position.x, position.y).stroke({
            width: getWidth("line")
        });
        preview.stroke({
            color: 'lightgray'
        });
    }

    draw.on('mousemove', handleMouseMove);
    EventListenerTrack("previewLine", "mousemove", handleMouseMove);
}


function text() {
    change_selection_state("off");
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
    EventListenerTrack("text_drawing", "click", handleClick);
}
function selection() {
    deselect();
    if (selection_type.length == 1 && selection_type[0] == "canvas") {
        change_selection_state("canvas");
    } else if (selection_type.length == 1 && selection_type[0] == "text") {
        change_selection_state("text");
    } else if (selection_type.length == 2) {
        change_selection_state("both");
    } else if (selection_type.length == 0) {
        change_selection_state("off");
    }
}

function free_draw() {
    change_selection_state("off");
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
            width: getWidth("draw")
        });
        path_object.stroke({
            color: getColor()
        });
        path_object.node.style.fill = "transparent";
        points.push([position.x, position.y]); 
        draw_f(points, path, path_object);
        points.push([position.x + 1 , position.y]); 
    }
    function let_go(event) {
        if (event.button !== 0) {
            return;
        }
        path_object.remove();
        let ramerDouglasPeucker_points = ramerDouglasPeucker(points, 3.0);
        let smooth_path;
        if (smooth_free_draw == true) {
            smooth_path = Catmull_Rom_Spline(transformArray(ramerDouglasPeucker_points), 1.0);
        } else {
            smooth_path = points_to_path(ramerDouglasPeucker_points);
        }
        let new_path = draw.path(smooth_path).stroke({
            width: getWidth("draw")
        });

        new_path.stroke({
            color: getColor()
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
        InitDrawLine(new_path, collission_path);

        points = [];
        path = "";
        draw.off("mousemove");

        let debug_c = false;
        if (debug_c == true) {
            for (let i = 0; i < ramerDouglasPeucker_points.length; i++) {
                const pnt = smooth_path.split(/[^\d.]+/)
                    // Filter out empty strings
                    .filter(str => str !== "")
                    // Group the numbers into pairs
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
    EventListenerTrack("free_draw", "mousedown", initial_check);
    draw.on("mouseup", let_go );
    EventListenerTrack("free_draw", "mouseup", let_go);
}
