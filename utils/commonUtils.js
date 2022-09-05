setDefaultValues();


// turn on highlighter by changing cursor and adding mouseup event listener
function turnOnHighlighter() {
    document.body.style.cursor = `url(${chrome.runtime.getURL('images/cursor.png')}), auto`;
    document.addEventListener("mouseup", handleMouseUp);
    window.highlighterTurnedOn = true;
}

// turn off highlighter by making cursor default and remove any mouseup event listeners
function turnOffHighlighter() {
    document.body.style.cursor = "default";
    document.removeEventListener("mouseup", handleMouseUp);
    window.highlighterTurnedOn = false;
}

// set default values for all global variables
function setDefaultValues() {
    if (!window.HIGHLIGHTER_INIT) {
        window.HIGHLIGHTER_INIT = true;
        window.highlighterTurnedOn = false;
    }

    chrome.storage.sync.get(['selectedColor'], (result) => {
        console.log("get", result);
        if (!result?.selectedColor) {
            chrome.storage.sync.set({selectedColor: "tomato"}, (result) => {
                console.log("set", result);
            });
        }
    });
}