
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch(request.task) {

            case TOGGLE_HIGHLIGHTER:
                if (window.highlighterTurnedOn) {
                    turnOffHighlighter();
                    sendResponse({res: HIGHLIGHTER_TURNED_OFF});
                } else {
                    turnOnHighlighter();
                    sendResponse({res: HIGHLIGHTER_TURNED_ON});
                }
                break;
            default:
                sendResponse({res: ERROR});
                break;
        }
    }
);