var selectedColor = DEFAULT_COLORS[0];
var colorsList = DEFAULT_COLORS;

window.addEventListener("load", async () => {
    // get values from storage and set default values
    let result = await getFromStorage("colorsList");
    if (result.colorsList) {
        colorsList = result.colorsList;
    }
    await getColor();
    window.highlighterTurnedOn = false;

    loadHighlightsOnStart();
});

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

async function getColor() {
    const result = await getFromStorage("selectedColor");
    if (result.selectedColor) {
        selectedColor = result.selectedColor;
    }
}

async function mouseUp(_event) {
    console.log("mouse up")
    await getColor();
    highlight(selectedColor);
}

async function highlight(color) {
    const selection = window.getSelection();
    const selectionString = selection.toString();
    const range = selection.getRangeAt(0);
    const highlightId = crypto.randomUUID();
    let container = selection.getRangeAt(0).commonAncestorContainer;
  
    // if selectionString is empty cancel highlighting
    if (selectionString.length <= 0) {
        return;
    }
    
    // find common parent node of both anchor node and focus node
    while (!container.innerHTML) {
        container = container.parentNode;
    }
  
    // create object to store all required highlight info
    let info = {
        uuid: highlightId,
        selectionString: selectionString,
        selectionLength: selectionString.length,
        startNode: range.startContainer,
        endNode: range.endContainer,
        startOffset: range.startOffset,
        endOffset: range.endOffset,
        color: color,
    };
  
    recursiveHighlight(container, info, 0, false);
    // add hover to highlights
    container.querySelectorAll('.HIGHLIGHT_TEXT').forEach((el, _i) => {
        el.addEventListener('mouseenter', onHighlightMouseEnterOrClick);
        el.addEventListener('click', onHighlightMouseEnterOrClick);
        el.addEventListener('mouseleave', onHighlightMouseLeave);
    });
    // remove selection
    selection.removeAllRanges();

    // save highlight in storage
    const highlightObj = {
        uuid: highlightId,
        selectionString: selectionString,
        selectionLength: selectionString.length,
        container: getCSSQuery(container),
        startNode: getCSSQuery(range.startContainer),
        endNode: getCSSQuery(range.endContainer),
        startOffset: range.startOffset,
        endOffset: range.endOffset,
        color: color,
        url: window.location.hostname + window.location.pathname
    }
    let hList = [];
    const result = await getFromStorage("highlightsList");
    if (result.highlightsList) hList = result.highlightsList;
    hList.push(highlightObj);
    setInStorage("highlightsList", hList);
}

// load all saved highlights for current url
async function loadHighlightsOnStart() {
    const result = await getFromStorage("highlightsList");
    if (result.highlightsList) {
        const myUrl = window.location.hostname + window.location.pathname;
        // filter highlights for this page
        const myHighlights = result.highlightsList.filter((h) => h.url == myUrl);
        
        // highlight each value
        myHighlights.map((myObj) => {
            try {
                // highlight
                let info = {
                    uuid: myObj.uuid,
                    selectionString: myObj.selectionString,
                    selectionLength: myObj.selectionString.length,
                    startNode: getElementFromQuery(myObj.startNode),
                    endNode: getElementFromQuery(myObj.endNode),
                    startOffset: myObj.startOffset,
                    endOffset: myObj.endOffset,
                    color: myObj.color,
                };
                recursiveHighlight(getElementFromQuery(myObj.container), info, 0, false);

                // add event listeners
                const container = getElementFromQuery(myObj.container);
                container.querySelectorAll('.HIGHLIGHT_TEXT').forEach((el, _i) => {
                    el.addEventListener('mouseenter', onHighlightMouseEnterOrClick);
                    el.addEventListener('click', onHighlightMouseEnterOrClick);
                    el.addEventListener('mouseleave', onHighlightMouseLeave);
                });
            } catch (err) {
                console.error('Error in loading highlights');
            }
        });
    }
}

function recursiveHighlight(element, info, charsdone, startFound) {
    element.childNodes.forEach((child, index) => {
        // if all characters highlighted exit
        if (charsdone >= info.selectionLength) {
            return [charsdone, startFound];
        }
    
        if (child.nodeType !== Node.TEXT_NODE) {
            // call function only for non text nodes
            [charsdone, startFound] = recursiveHighlight(child, info, charsdone, startFound);
        } else {
            // for text nodes start highlighting operation
    
            if (charsdone >= info.selectionLength) {
            return [charsdone, startFound];
            }
    
            // if child is startNode or it was already found
            if (startFound || info.startNode === child) {
            startFound = true;
    
            let currentString = child.nodeValue;
            // something is already highlighted then set start as 0
            let start = charsdone !== 0 ? 0 : info.startOffset;
    
            // if charsCanBeHighlighted is greater than charsToBeLightlighted then
            // set end value as length-1 else set it start + remaining chars
            let end =
                currentString.length - start > info.selectionLength - charsdone
                ? start + info.selectionLength - charsdone
                : currentString.length - 1;
    
            let i = start;
            // loop  until all chars are not highlighted
            // or all chars from current string are not finished
            while (i <= currentString.length - 1) {
                // console.log("i", i)
                // skip all white spaces from selection string as thier can be many than one
                while (
                charsdone < info.selectionLength &&
                info.selectionString[charsdone].match(/\s/u)
                )
                charsdone++;
    
                if (charsdone >= info.selectionLength) break;
    
                // if characters are matched increment charsdone so they can be highlighted later
                if (info.selectionString[charsdone] === currentString[i]) {
                charsdone++;
                }
    
                i++;
            }
    
            // split child node in three parts:
            let beforePart = child; // before selected part
            let middlePart = child.splitText(start); // the selected part
            let afterPart = middlePart.splitText(i - beforePart.length); // after selected part
    
            // create a new highlight node from span and assign neccessary styles
            const highlightNode = document.createElement('span');
            highlightNode.style.backgroundColor = info.color;
            highlightNode.textContent = middlePart.nodeValue;
            highlightNode.classList.add("HIGHLIGHT_TEXT");
            highlightNode.classList.add(`HIGHLIGHTID_${info.uuid}`);
            highlightNode.setAttribute('data-highlight-id', info.uuid);
            // insert highlightNode before selected part
            middlePart.parentNode.insertBefore(highlightNode, middlePart);
            // remove old selected part
            middlePart.remove();
            // merge sibling and empty text nodes
            beforePart.parentNode.normalize();
            }
        }
    });
    
    return [charsdone, startFound];
}

function getCSSQuery(node) {
    // if it has id stop search and return
    if (node.id) return `#${node.id.replace(/(:)/ug, "\\$1")}`;
    // if we have reached end html node
    if (node.localName == 'html') return 'html';
  
    let parent = node.parentNode;
    let parentQuery = getCSSQuery(parent);
  
    // get index of node in DOM
    // if it is a text node
    if (!node.localName) {
        const index = Array.prototype.indexOf.call(parent.childNodes, node);
        return `${parentQuery}>textNode:nth-of-type(${index})`;
    } else {
        const index = Array.from(parent.childNodes).filter((child) => child.localName === node.localName).indexOf(node) + 1;
        return `${parentQuery}>${node.localName}:nth-of-type(${index})`;
    }
}
  
function getElementFromQuery(query) {
    // check if it ends with text node
    const re = />textNode:nth-of-type\(([0-9]+)\)$/ui; // re used from someone else code
    const result = re.exec(query);
  
    if (result) {
        // for text node remove it from 
        const index = parseInt(result[1], 10);
        query = query.replace(re, "");
        const parent = document.querySelector(query);
  
        if (!parent) return undefined;
        return parent.childNodes[index];
    }
  
    return document.querySelector(query);
}