var highlighterTurnedOn = false;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      switch(request.task) {
        case HIGHLIGHT_ON:
            turnOnHighlighter();
            sendResponse({res: HIGHLIGHTER_TURNED_ON});
            break;
        case HIGHLIGHT_OFF:
            turnOffHighlighter();
            sendResponse({res: HIGHLIGHTER_TURNED_OFF});
            break;
        default:
            sendResponse({res: ERROR});
            break;
      }
    }
);

function turnOnHighlighter() {
    highlighterTurnedOn = true;
    document.body.style.cursor = `url(${chrome.runtime.getURL('images/cursor.png')}), auto`;
    document.addEventListener("mouseup", handleMouseUp);
}

function turnOffHighlighter() {
    highlighterTurnedOn = false;
    document.body.style.cursor = "default";
    document.removeEventListener("mouseup", handleMouseUp);
}

function handleMouseUp(_event) {
    if (highlighterTurnedOn) {
        console.log("highlighter clicked");
    }
}