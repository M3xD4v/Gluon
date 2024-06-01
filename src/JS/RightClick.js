
    function showCustomMenu(x, y) {
        var customMenu = document.getElementById("customMenu");
        customMenu.style.display = "block";
        customMenu.style.left = x + "px";
        customMenu.style.top = y + "px";
    }


    function hideCustomMenu() {
        var customMenu = document.getElementById("customMenu");
        customMenu.style.display = "none";
    }


    document.addEventListener("contextmenu", function(event) {
        var sampleText = document.getElementById("sampleText");
        if (window.getSelection()) {
            event.preventDefault();
            showCustomMenu(event.clientX, event.clientY);
        } else {
            hideCustomMenu();
        }
    });


    document.getElementById("copyAction").addEventListener("click", function(event) {
        document.execCommand("copy");
        hideCustomMenu();
    });



    document.addEventListener("click", function(event) {
        if (!document.getElementById("customMenu").contains(event.target)) {
            hideCustomMenu();
        }
    });