function hide_all_menus() {
    document.getElementById("settings_line").style.display = "none";
    document.getElementById("settings_draw").style.display = "none";
    document.getElementById("settings_selection").style.display = "none";
}

function show_settings_buttons(name) {
    if (name === "line") {
        let elements = document.getElementsByClassName("line_settings")
        let color_button = document.getElementById("color_settings"); color_button.style.display = "inline-flex";
        let delete_button = document.getElementById("delete_button"); delete_button.style.display = "inline-flex";
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.display = "inline-flex";
        }
    } else if (name === "draw") {
        let elements = document.getElementsByClassName("draw_settings")
        let color_button = document.getElementById("color_settings"); color_button.style.display = "inline-flex";
        let delete_button = document.getElementById("delete_button"); delete_button.style.display = "inline-flex";
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.display = "inline-flex";
        }
    }
}
function toggle_buttons(name) {
    if (name === "line") {
        let elements = document.getElementById("line_button")
        elements.classList.toggle("button_active");
        elements.classList.toggle("button");
        let img = elements.getElementsByTagName("img")[0];         img.style.filter = "invert(100)";
        
    } else if (name === "draw") {
        let elements = document.getElementById("draw_button")
        elements.classList.toggle("button");
        elements.classList.toggle("button_active");
        let img = elements.getElementsByTagName("img")[0];
        img.style.filter = "invert(100)";
    } else if (name === "selection") {
        let elements = document.getElementById("selection_button")
        elements.classList.toggle("button");
        elements.classList.toggle("button_active");
        let img = elements.getElementsByTagName("img")[0];
        img.style.filter = "invert(100)";
    } else if (name === "text") {
        let elements = document.getElementById("text_button")
        elements.classList.toggle("button");
        elements.classList.toggle("button_active");
        let img = elements.getElementsByTagName("img")[0];
        img.style.filter = "invert(100)";
    }
}

function toggle_button_by_id(object) {
        let elements = document.getElementById(object)
        elements.classList.toggle("button_active");
        elements.classList.toggle("button");

}
function line_settings() {

    if (document.getElementById("settings_line").style.display === "none") {
        hide_all_menus();
        document.getElementById("settings_line").style.display = "block";
    } else {
        document.getElementById("settings_line").style.display = "none";
    }
}
function draw_settings() {
    if (document.getElementById("settings_draw").style.display === "none") {
        hide_all_menus();
        document.getElementById("settings_draw").style.display = "block";
    } else {
        document.getElementById("settings_draw").style.display = "none";
    }
}
function selection_settings() {
    if (document.getElementById("settings_selection").style.display === "none") {
        hide_all_menus();
        document.getElementById("settings_selection").style.display = "block";
    } else {
        document.getElementById("settings_selection").style.display = "none";
    }
}
function toggle_smoothing() {
    let button = document.getElementById("smoothing_toggle");
    if (button.classList.contains("checkmark")) {
        button.classList.remove("checkmark");
        button.classList.add("checkmark_active");
        smooth_free_draw = true;
        if (selected != null) {
            selected.smoothing = "true";
            path_smoothen(selected)
        }
    } else if (button.classList.contains("checkmark_active")) {
        button.classList.remove("checkmark_active");
        button.classList.add("checkmark");
        smooth_free_draw = false;
        if (selected != null) {
            selected.smoothing = "false";
        }
    }
}

function adjust_width(value,object) {
    let string = object + "_widthvalue"
    let input = document.getElementById(string);
    if (value == -1){
        input.value = parseInt(input.value) - 1;
    }
    if (value == 1){
        input.value = parseInt(input.value) + 1;
    }
    if (selected != null){
        selected.object.node.setAttribute("stroke-width",parseInt(input.value))
    }
}