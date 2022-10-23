var highlightClicked = false;
var highlightHoverTimeout = null;
var currentHighlightEl = null;
var changeColorButton = null;
var deleteButton = null;

window.addEventListener("load", () => {
    // get html and append it to end of page body
    fetch(chrome.runtime.getURL('contentScripts/highlightMenu.html')).then((response) => {
        return response.text();
    }).then((htmlData) => {
        const newElement = document.createElement("div");
        newElement.innerHTML = htmlData;
        newElement.classList.add("HIGHLIGHT_CONTEXTMENU");
        newElement.style.display = "none";
        newElement.addEventListener('mouseenter', onHoverToolMouseEnter);
        newElement.addEventListener('mouseleave', onHighlightMouseLeave);
        document.getElementsByTagName('body')[0].appendChild(newElement);
        changeColorButton = newElement.querySelector('#HIGHLIGHT_CONTEXTMENU_CHANGECOLOR_BTN');
        deleteButton = newElement.querySelector('#HIGHLIGHT_CONTEXTMENU_DELETE_BTN');
        changeColorButton.addEventListener("click", changeColor);
        deleteButton.addEventListener("click", deleteHighlight);
    }).catch((err) => {
        console.error(err);
        console.warn("Highlighter extension: something went wrong !");
    });
});

function changeColor(_event) {
    console.log("hellow")
}

function deleteHighlight(_event) {
    console.log("hdeefa")
}

function onHoverToolMouseEnter() {
    if (highlightHoverTimeout !== null) {
        clearTimeout(highlightHoverTimeout);
        highlightHoverTimeout = null;
    }
}

function onHighlightMouseLeave() {
    if (!highlightClicked) {
        highlightHoverTimeout = setTimeout(() => {
            document.getElementsByClassName("HIGHLIGHT_CONTEXTMENU")[0].style.display = "none";
            highlightHoverTimeout = null;
            highlightClicked = false;
        }, 170);
    }
}

function onHighlightMouseEnterOrClick(e) {
    const newHighlightEl = e.target;
    const newHighlightId = newHighlightEl.getAttribute('data-highlight-id');

    // If the previous action was a click but now it's a mouseenter, don't do anything
    if (highlightClicked && e.type !== 'click') return;
    highlightClicked = e.type === 'click';

    if (highlightHoverTimeout !== null) {
        clearTimeout(highlightHoverTimeout);
        highlightHoverTimeout = null;
        if (newHighlightId === currentHighlightEl.getAttribute('data-highlight-id')) return;
    }

    currentHighlightEl = newHighlightEl;    
    moveToolbarToHighlight(newHighlightEl, e.clientX);
}

function moveToolbarToHighlight(highlightEl, cursorX) {
    const boundingRect = highlightEl.getBoundingClientRect();
    const toolWidth = 100;
    const hoverTop = boundingRect.top - 45 + window.scrollY;
    const hoverToolEl = document.getElementsByClassName("HIGHLIGHT_CONTEXTMENU")[0];
    hoverToolEl.style.top = `${hoverTop}px`;
    
    if (cursorX !== undefined) {
        let hoverLeft = null;
        if (boundingRect.width < toolWidth) {
            hoverLeft = boundingRect.left + (boundingRect.width / 2) - (toolWidth / 2);
        } else if (cursorX - boundingRect.left < toolWidth / 2) {
            hoverLeft = boundingRect.left;
        } else if (boundingRect.right - cursorX < toolWidth / 2) {
            hoverLeft = boundingRect.right - toolWidth;
        } else {
            hoverLeft = cursorX - (toolWidth / 2);
        }
        hoverToolEl.style.left = `${hoverLeft}px`;
    }
    hoverToolEl.style.display = "flex";
}