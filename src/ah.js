const textbox = document.querySelector('.textbox');
const buttons = document.querySelector('.buttons');
let isMovingMode = false
let offsetX = 0;
let offsetY = 0;
const buttonIds = ['bold', 'italic', 'underline', 'color', 'increase', 'decrease', 'move'];
const [boldButton, italicButton, underlineButton, colorButton, increaseButton, decreaseButton, moveButton] = buttonIds.map(id => document.getElementById(id));
let fontSize = 16;

function changeFontSize(size) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    let range = selection.getRangeAt(0);
    let span = document.createElement('span');
    span.style.fontSize = `${size}px`;
    span.textContent = range.toString();
    range.deleteContents();
    range.insertNode(span);
}

moveButton.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isMovingMode = true;
    const rect = textbox.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
});

moveButton.addEventListener('mouseup', () => isMovingMode = false);

document.addEventListener('mousemove', (e) => {
    if (isMovingMode) {
        const position = (pos) => `${e.clientX - pos}px`;
        textbox.style.left = position(offsetX);
        textbox.style.top = position(offsetY);
        buttons.style.left = position(offsetX);
        buttons.style.top = `${e.clientY - offsetY - buttons.offsetHeight}px`;
    }
});

textbox.addEventListener('focus', () => {
    buttons.style.display = 'flex';
    const rect = textbox.getBoundingClientRect();
    buttons.style.left = `${rect.left}px`;
    buttons.style.top = `${rect.top - buttons.offsetHeight}px`;
});

textbox.addEventListener('blur', () => buttons.style.display = 'none');

[increaseButton, decreaseButton, boldButton, italicButton, underlineButton].forEach(button => {
    button.addEventListener('mousedown', (e) => e.preventDefault());
});

increaseButton.addEventListener('click', () => changeFontSize(++fontSize));
decreaseButton.addEventListener('click', () => changeFontSize(--fontSize));

[boldButton, italicButton, underlineButton].forEach((button, i) => {
    button.addEventListener('click', () => document.execCommand(['bold', 'italic', 'underline'][i], false, null));
});

const colorPicker = document.getElementById('colorPicker');
colorPicker.addEventListener('input', () => document.execCommand('foreColor', false, colorPicker.value));
colorPicker.addEventListener('mousedown', (e) => e.preventDefault());