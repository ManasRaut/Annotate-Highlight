// variables and constants
const ADDBUTTON_ON_CLASS = "add-btn add-btn-on";
const ADDBUTTON_OFF_CLASS = "add-btn add-btn-off";

// DOM references
const toggleExtensionOnorOffButton = document.getElementById("toggleExtension");
const addNewHighlightBtn = document.getElementById("addHighlight");
const listBox = document.getElementById("listBox");

var highlightsList = [];
var selectedColor = 'tomato';
var selectedColorId = 'redcolor';

toggleExtensionOnorOffButton.addEventListener("click", (_event) => {
    chrome.storage.sync.set({extensionStatus: _event.target.checked});
});

addNewHighlightBtn.addEventListener("click", (_event) => {
    toggleHighlighter();
});

[...document.getElementsByClassName("color-button")].forEach(element => {
    element.addEventListener("click", changeColor);
});

chrome.storage.sync.get(['selectedColor'], (result) => {
    if (result?.selectedColor) {
        let oldNode = document.querySelector(`[data-color="${selectedColor}"]`);
        let newNode = document.querySelector(`[data-color="${result.selectedColor}"]`);
        oldNode.classList.remove("selectedColor");
        newNode.classList.add("selectedColor");
        selectedColor = result.selectedColor;
        selectedColorId = newNode.id;
    }
});

function changeColor(_event) {
    const newColor = _event.target.dataset.color;
    chrome.runtime.sendMessage(
        message={
            task: CHANGE_COLOR,
            data: newColor
        },
        (response) => {
            if (response.res === SUCCESS) {
                document.getElementById(selectedColorId).classList.remove("selectedColor");
                document.getElementById(_event.target.id).classList.add("selectedColor");
                selectedColor = newColor;
                selectedColorId = _event.target.id;
            }
        }
    );
}

function toggleHighlighter() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        console.log(tabs)
        chrome.tabs.sendMessage( tabs[0].id, {
                task: TOGGLE_HIGHLIGHTER,
            }, (response) => handleResponse(response)
        );
    });
}

function handleResponse(response) {
    switch(response.res) {
        case HIGHLIGHTER_TURNED_ON:
            addNewHighlightBtn.className = ADDBUTTON_ON_CLASS;
            break;
        case HIGHLIGHTER_TURNED_OFF:
            addNewHighlightBtn.className = ADDBUTTON_OFF_CLASS;
            break;
        case ERROR:
            // TODO : add error message in popup
            break;
        default:
            break;
    }
}