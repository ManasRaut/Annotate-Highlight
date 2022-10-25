var highlightClicked = false;
var highlightHoverTimeout = null;
var currentHighlightEl = null;
var deleteButton = null;
var copyButton = null;

window.addEventListener("load", () => {
    // get html and append it to end of page body
    fetch(chrome.runtime.getURL('contentScripts/highlightMenu.html')).then((response) => {
        return response.text();
    }).then((htmlData) => {
        // create new hover element and add fetched content
        const newElement = document.createElement("div");
        newElement.innerHTML = htmlData;
        newElement.classList.add("HIGHLIGHT_CONTEXTMENU");
        newElement.style.display = "none";
        // attach eventListeners and get references to HTML buttons
        newElement.addEventListener('mouseenter', onHoverToolMouseEnter);
        newElement.addEventListener('mouseleave', onHighlightMouseLeave);
        document.getElementsByTagName('body')[0].appendChild(newElement);
        deleteButton = newElement.querySelector('#HIGHLIGHT_CONTEXTMENU_DELETE_BTN');
        copyButton = newElement.querySelector('#HIGHLIGHT_CONTEXTMENU_COPY_BTN');
        deleteButton.addEventListener("click", () => deleteHighlight(currentHighlightEl.getAttribute("data-highlight-id")));
        copyButton.addEventListener("click", () => copyHighlight(currentHighlightEl.getAttribute("data-highlight-id")));
    }).catch((err) => {
        console.error(err);
        console.warn("Highlighter extension: something went wrong !");
    });
});

function deleteHighlight(highlightId) {
    // find all nodes with uuid of selected element
    const highlightEls = document.querySelectorAll(`.HIGHLIGHTID_${highlightId}`);
    // replace this elements with text nodes
    for(let i=0; i<highlightEls.length; i++) {
        const tmpNode = highlightEls[i];
        const tmpTextNode = document.createTextNode(tmpNode.textContent);
        tmpNode.parentNode.insertBefore(tmpTextNode, tmpNode);
        tmpNode.parentNode.normalize();
        tmpNode.remove();
    }
    // update new highlight list
    const newHighlistList = highlightsList.filter((h, _i) => h.uuid !== highlightId);
    setInStorage("highlightsList", newHighlistList);
    onHighlightMouseLeave({});
}

function copyHighlight(highlightId) {
    // copy selecionString from saved highlights list
    const highlight = highlightsList.find((h, _i) => h.uuid === highlightId);
    navigator.clipboard.writeText(highlight.selectionString);
    onHighlightMouseLeave({});    
}

function onHoverToolMouseEnter() {
    if (highlightHoverTimeout !== null) {
        clearTimeout(highlightHoverTimeout);
        highlightHoverTimeout = null;
    }
}

function onHighlightMouseLeave(e) {
    if (!highlightClicked) {
        highlightHoverTimeout = setTimeout(() => {
            document.getElementsByClassName("HIGHLIGHT_CONTEXTMENU")[0].style.display = "none";
            highlightHoverTimeout = null;
            highlightClicked = false;
        }, 270);
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
    const toolWidth = 148;
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