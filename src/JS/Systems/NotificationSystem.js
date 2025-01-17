let value_notifications = []
function showNotification(text, time) {
    let notification = document.getElementById("notification");
    let seconds = time * 1000 + 1000;
    notification.style.transition = "top " + 0.5 + "s " + "ease";
    notification.style.top = "50px";
    notification.innerHTML = text;
    notification.style.backgroundColor = "rgb(2 2 2 / 65%)"; 
    notification.style.border = 0;
    notification.style.color = "white";
    setTimeout(() => {
        notification.style.top = "-16vh";
    }, seconds);
}

function showNotificationValue(text) {
    if (value_notifications.length == 0) {
    let notification = document.createElement("div");
    value_notifications.push(notification);
    document.body.appendChild(notification);
    notification.innerHTML = text;
    notification.style.position = "fixed";
    notification.style.top = "80vh";
    notification.style.padding = "10px 20px";
    notification.style.color = "#FF4500";
    notification.style.transition = "color 0.5s ease";
    setTimeout(() => {
        notification.style.color = "transparent";
    }, 500);

} else {
    if (value_notifications.length === 3) {
        value_notifications[0].remove();
        value_notifications.shift();
    }

    for (let i = 0; i < value_notifications.length; i++) {
        value_notifications[i].style.top = parseInt(value_notifications[i].style.top.split("vh")[0]) + 3 + "vh";
    }

    let notification = document.createElement("div");
    value_notifications.push(notification);
    document.body.appendChild(notification);
    notification.innerHTML = text;
    notification.style.position = "fixed";
    notification.style.top = "80vh";
    notification.style.padding = "10px 20px";
    notification.style.color = "#FF4500";
    notification.style.transition = "color 0.5s ease";
    setTimeout(() => {
        notification.style.color = "transparent";
    }, 500);


}
}
