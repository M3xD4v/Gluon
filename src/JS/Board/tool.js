function notool() {
    console.log("notool")
}

function line() {
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
    function handleClick(event) {
        const position = draw.point(event.clientX, event.clientY);
        createMovableTextbox(position);
        resetTools();
    }
    draw.on('click', handleClick);
    EventListenerTrack("text_drawing", "click", handleClick);
}