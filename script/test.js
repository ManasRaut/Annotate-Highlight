let altPressed = false;
let hColor = 'tomato';

document.addEventListener("DOMContentLoaded", () => {
    console.log("Loaded...")

    document.addEventListener("keydown", (_event) => {
        if (_event.key === "z") {
            altPressed = !altPressed;
            if (altPressed) {
                document.body.style.cursor = "pointer";
            } else {
                document.body.style.cursor = "default";
            }
        }
        switch (_event.key) {
            case "1":
                hColor = "tomato";
                break;
            case "2":
                hColor = "dodgerblue";
                break;
            case "3":
                hColor = "lime";
                break;
            case "4":
                hColor = "wheat";
                break;
            default:
                hColor = "tomato";
                break;
        }
    });

    document.addEventListener("mouseup", (_event) => {
        if (altPressed) {
            highlight(hColor);
        }
    });
});

function highlight(color) {
    const selection = window.getSelection();
    const selectionString = selection.toString();
    const range = selection.getRangeAt(0);
    let container = selection.getRangeAt(0).commonAncestorContainer;

    // find common parent node of both anchor node and focus node
    while (!container.innerHTML) {
        container = container.parentNode;
    }

    // create object to store all required highlight info
    let info = {
        selectionString: selectionString,
        selectionLength: selectionString.length,
        startNode: range.startContainer,
        endNode: range.endContainer,
        startOffset: range.startOffset,
        endOffset: range.endOffset,
        color: color
    }

    console.log(recursiveHighlight(container, info, 0, false));
    // remove selection
    selection.removeAllRanges();
}

function recursiveHighlight(element, info, charsdone, startFound) {
    element.childNodes.forEach((child, index) => {

        // if all characters highlighted exit
        if (charsdone >= info.selectionLength) {
            return [charsdone, startFound];
        }

        if (child.nodeType !== Node.TEXT_NODE) { // call function only for non text nodes
            [charsdone, startFound] = recursiveHighlight(child, info, charsdone, startFound);
        } else { // for text nodes start highlighting operation

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
                let end = currentString.length - start > info.selectionLength - charsdone ? 
                    start + info.selectionLength - charsdone : currentString.length - 1 ;

                let i = start;
                // loop  until all chars are not highlighted 
                // or all chars from current string are not finished
                while (i <= currentString.length-1) {
                    // console.log("i", i)
                    // skip all white spaces from selection string as thier can be many than one
                    while (charsdone < info.selectionLength && info.selectionString[charsdone].match(/\s/u)) charsdone++;

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