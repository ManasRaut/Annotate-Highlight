var selectedColor = DEFAULT_COLORS[0];
var colorsList = DEFAULT_COLORS;

window.onload = async () => {
    // get values from storage and set default values
    let result = await getFromStorage("colorsList");
    if (result.colorsList) {
        colorsList = result.colorsList;
    }
    result = await getFromStorage("selectedColor");
    if (result.selectedColor) {
        selectedColor = result.selectedColor;
    }
    window.highlighterTurnedOn = false;
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch(request.task) {    
            case TOGGLE_HIGHLIGHTER:
                if (window.highlighterTurnedOn) {
                    turnOffHighlighter();
                    sendResponse({res: HIGHIGHTER_OFF});
                } else {
                    turnOnHighlighter();
                    sendResponse({res: HIGHIGHTER_ON});
                }
                break;
            case IS_HIGHLIGHTER_ON:
                if (window.highlighterTurnedOn) {
                    sendResponse({res: HIGHIGHTER_ON});
                } else {
                    sendResponse({res: HIGHIGHTER_OFF});
                }
                break;
            default:
                sendResponse({res: ERROR});
                break;
        }
    }
);

// turn on highlighter by changing cursor and adding mouseup event listener
function turnOnHighlighter() {
    document.body.style.cursor = `url(${chrome.runtime.getURL('images/cursor.png')}), auto`;
    document.addEventListener("mouseup", mouseUp);
    window.highlighterTurnedOn = true;
}

// turn off highlighter by making cursor default and remove any mouseup event listeners
function turnOffHighlighter() {
    document.body.style.cursor = "default";
    document.removeEventListener("mouseup", mouseUp);
    window.highlighterTurnedOn = false;
}

function mouseUp(_event) {
    console.log("mouse up")
    // TODO: add highlighting code
}