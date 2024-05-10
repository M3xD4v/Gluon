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
            execute(line_f(firstPosition, secondPosition, getColor(), getWidth()));
            resetTools()
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
            width: getWidth()
        });
        preview.stroke({
            color: 'lightgray'
        });
    }

    draw.on('mousemove', handleMouseMove);
    EventListenerTrack("previewLine", "mousemove", handleMouseMove);
}

function text(){
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