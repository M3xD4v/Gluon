    // Function to show custom menu
    function showCustomMenu(x, y) {
        var customMenu = document.getElementById("customMenu");
        customMenu.style.display = "block";
        customMenu.style.left = x + "px";
        customMenu.style.top = y + "px";
    }

    // Function to hide custom menu
    function hideCustomMenu() {
        var customMenu = document.getElementById("customMenu");
        customMenu.style.display = "none";
    }

    // Event listener for right-click
    document.addEventListener("contextmenu", function(event) {
        var sampleText = document.getElementById("sampleText");
        if (window.getSelection()) {
            event.preventDefault();
            showCustomMenu(event.clientX, event.clientY);
        } else {
            hideCustomMenu();
        }
    });

    // Event listeners for menu actions
    document.getElementById("copyAction").addEventListener("click", function(event) {
        document.execCommand("copy");
        hideCustomMenu();
    });


    // Hide custom menu when clicking outside
    document.addEventListener("click", function(event) {
        if (!document.getElementById("customMenu").contains(event.target)) {
            hideCustomMenu();
        }
    });