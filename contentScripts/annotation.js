var editBox = null;
var clickPageX = 0;
var clickPageY = 0;

window.addEventListener("load", () => {
    // get html and append it to end of page body
    fetch(chrome.runtime.getURL('contentScripts/annotation/annotation.html')).then((response) => {
        return response.text();
    }).then((htmlData) => {
        // create annotation edit box
        editBox = document.createElement("div");
        editBox.classList.add("annotation-cont");
        editBox.style.display = "none";
        editBox.innerHTML = htmlData;
        document.getElementsByTagName('body')[0].appendChild(editBox);
        
    }).catch((err) => {
        console.error(err);
        console.warn("Highlighter extension: something went wrong !");
    });
});

window.addEventListener("contextmenu", (_event) => {
    clickPageX = _event.pageX;
    clickPageY = _event.pageY;
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch(request.task) {    
            case ADD_ANNOTATION:
                addAnnotation();
                sendResponse({res: SUCCESS});
                break;
            default:
                sendResponse({res: ERROR});
                break;
        }
    }
);

function addAnnotation() {
    const newAnnotateCursor = document.createElement("div");
    newAnnotateCursor.classList.add("annotation-cursor");
    newAnnotateCursor.style.left = `${clickPageX}px`;
    newAnnotateCursor.style.top = `${clickPageY-25}px`;
    document.getElementsByTagName("body")[0].appendChild(newAnnotateCursor);
    window.annotationTurnedOn = false;
}