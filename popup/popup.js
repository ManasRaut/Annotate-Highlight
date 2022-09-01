// variables and constants
const ADDBUTTON_ON_CLASS = "add-btn add-btn-on";
const ADDBUTTON_OFF_CLASS = "add-btn add-btn-off";

// DOM references
const toggleExtensionOnorOffButton = document.getElementById("toggleExtension");
const addNewHighlightBtn = document.getElementById("addHighlight");
const listBox = document.getElementById("listBox");

var highlightsList = [];

toggleExtensionOnorOffButton.addEventListener("click", (_event) => {
    chrome.storage.sync.set({extensionStatus: _event.target.checked});
});

addNewHighlightBtn.addEventListener("click", (_event) => {
    turnOnHighlighter();
});

function turnOnHighlighter() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        console.log(tabs)
        chrome.tabs.sendMessage(
            tabs[0].id, 
            {
                task: HIGHLIGHT_ON,
                nextId: highlightsList.length
            },
            (response) => handleResponse(response)
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