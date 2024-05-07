document.addEventListener('DOMContentLoaded', function () {
    var ColorInput = document.getElementById('ColorI');

    ColorInput.addEventListener('input', function () {
        if (canvas.getActiveObject() != null) {
            let activeObject = canvas.getActiveObject()

            if (activeObject.type == "text") {
                activeObject.set('fill', ColorInput.value);
                canvas.renderAll();
            }

            if (activeObject.type == "line") {
                activeObject.set('stroke', ColorInput.value);
                canvas.renderAll();
            }



        }
    });
    function CheckIfSelected() {
            var activeObject = canvas.getActiveObject();
            if (activeObject) {
                if (activeObject._objects == undefined && activeObject.type == "line") {
                    lineControlPoints(activeObject)
                } else if (activeObject._objects != undefined) {
                        for (var i = 0; i < activeObject._objects.length; i++) {
                            if (activeObject._objects[i].type === "line") {
                                lineControlPoints(activeObject._objects[i])
                            }
                        }
                        canvas.discardActiveObject().renderAll();
                    }
            } else {
                return
            };
    }
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            deleteControlPoints();
            canvas.discardActiveObject().renderAll();

        }
    });
    
    setInterval(CheckIfSelected, 100);

});