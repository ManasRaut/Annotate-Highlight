var clickPageX = 0;
var clickPageY = 0;
var annotationList = [];

window.addEventListener("load", async () => {
    loadAllAnnotations();
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
            case DELETE_ANNOTATION:
                deleteAnnotation(request.uuid);
                sendResponse({res: SUCCESS});
                break;
            case EDIT_ANNOTATION:
                editAnnotation(request.uuid);
                sendResponse({res: SUCCESS});
            default:
                sendResponse({res: ERROR});
                break;
        }
    }
);

async function addAnnotation() {
    const result = await getFromStorage("annotationList");
    if (result.annotationList) annotationList = result.annotationList;
    const annotateId = crypto.randomUUID();
    const myUrl = window.location.hostname + window.location.pathname;
    const info = {
        url : myUrl,
        uuid : annotateId,
        text : "",
        pageX : clickPageX,
        pageY : clickPageY,
    };

    const newAnnotateCursor = document.createElement("div");
    newAnnotateCursor.classList.add("annotation-cursor");
    newAnnotateCursor.classList.add(`ANNOTATION_${annotateId}`);
    newAnnotateCursor.style.left = `${clickPageX}px`;
    newAnnotateCursor.style.top = `${clickPageY-25}px`;
    newAnnotateCursor.addEventListener("click", () => editAnnotation(annotateId));
    newAnnotateCursor.setAttribute("data-annotate-id", annotateId);
    document.getElementsByTagName("body")[0].appendChild(newAnnotateCursor);
    annotationList.push(info);
    window.annotationTurnedOn = false;
    editAnnotation(annotateId);
    setInStorage("annotationList", annotationList);
}

async function loadAllAnnotations() {
    const result = await getFromStorage("annotationList");
    if (result.annotationList) annotationList = result.annotationList;

    annotationList.forEach((a) => {
        const newAnnotateCursor = document.createElement("div");
        newAnnotateCursor.classList.add("annotation-cursor");
        newAnnotateCursor.classList.add(`ANNOTATION_${a.uuid}`);
        newAnnotateCursor.style.left = `${a.pageX}px`;
        newAnnotateCursor.style.top = `${a.pageY-25}px`;
        newAnnotateCursor.addEventListener("click", () => editAnnotation(a.uuid));
        newAnnotateCursor.setAttribute("data-annotate-id", a.uuid);
        document.getElementsByTagName("body")[0].appendChild(newAnnotateCursor);
    });
}