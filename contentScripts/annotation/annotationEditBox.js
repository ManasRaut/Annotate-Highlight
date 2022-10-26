var editBox = null;
var editBoxTextArea = null;
var currentAnnotateCursor = null;
var currentAnnotation = null;

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
        editBoxTextArea = editBox.querySelector(".annotation-editbox");
        editBox.querySelector(".annotation-close-btn").addEventListener("click", closeEditBox);
        editBox.querySelector(".annotation-delete-btn").addEventListener("click", () => deleteAnnotation(currentAnnotation.uuid));
    }).catch((err) => {
        console.error(err);
        console.warn("Highlighter extension: something went wrong !");
    });
});

function editAnnotation(annotateId) {
    currentAnnotateCursor = document.querySelector(`.ANNOTATION_${annotateId}`);
    currentAnnotateCursor.style.display = "none";
    currentAnnotation = annotationList.find((a) => a.uuid === annotateId);
    editBox.style.left = `${currentAnnotation.pageX}px`;
    editBox.style.top = `${currentAnnotation.pageY}px`;
    editBox.style.display = "block";
    editBoxTextArea.innerHTML = currentAnnotation.text;
    editBox.scrollIntoView({behavior: 'smooth', block:"center"});
}

async function closeEditBox() {
    const result = await getFromStorage("annotationList");
    if (result.annotationList) annotationList = result.annotationList;

    annotationList.map((a) => {
        if (a.uuid === currentAnnotation.uuid) {
            a.text = editBoxTextArea.innerHTML;
        }
    })
    setInStorage("annotationList", annotationList);

    currentAnnotateCursor.style.display = "block";
    editBox.style.display = "none";
    currentAnnotateCursor = null;
    currentAnnotation = null;
}

async function deleteAnnotation(uuid) {
    const result = await getFromStorage("annotationList");
    if (result.annotationList) annotationList = result.annotationList;
    const newAnnotationList = annotationList.filter((a) => a.uuid !== uuid);
    annotationList = newAnnotationList;
    setInStorage("annotationList", newAnnotationList);
    document.querySelector(`.ANNOTATION_${uuid}`)?.remove();
    editBox.style.display = "none";
    currentAnnotateCursor = null;
    currentAnnotation = null;
}