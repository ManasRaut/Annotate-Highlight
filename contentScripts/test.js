let altPressed = false;
let hColor = 'tomato';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Loaded...');

  document.addEventListener('keydown', (_event) => {
    if (_event.key === 'z') {
      altPressed = !altPressed;
      if (altPressed) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'default';
      }
    }
    // switch (_event.key) {
    //   case '1':
    //     hColor = 'tomato';
    //     break;
    //   case '2':
    //     hColor = 'dodgerblue';
    //     break;
    //   case '3':
    //     hColor = 'lime';
    //     break;
    //   case '4':
    //     hColor = 'wheat';
    //     break;
    //   default:
    //     hColor = 'tomato';
    //     break;
    // }
  });

  document.addEventListener('mouseup', (_event) => {
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
    color: color,
  };

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

    if (child.nodeType !== Node.TEXT_NODE) {
      // call function only for non text nodes
      [charsdone, startFound] = recursiveHighlight(
        child,
        info,
        charsdone,
        startFound
      );
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
// HuePicker
let parent = document.getElementById('container');

createHuePicker(
  parent,
  (hue) => {
    hColor = `hsl(${hue}, 100%, 70%)`;
  },
  50
);

/*
  Main function, creates the hue picker inside a parent that you provide (such as a div).
  As the user picks different hues, you are notified via the callback.
  The hue value is provided as an argument, and you can use it to update other parts of your UI.
  You can also pass an initial hue, via the thrid argument.
*/
function createHuePicker(parent, callback, initialHue = 0) {
  let canvas = document.createElement('canvas'),
    label = document.createElement('div');

  canvas.width = 300;
  canvas.height = 300;
  canvas.style.float = 'center';
  label.style.fontWeight = 'bold';
  label.style.fontSize = '20px';
  label.style.display = 'block';
  label.style.margin = '10px auto 10px 30px';
  label.style.width = '220px';
  label.style.height = 'auto';
  label.style.textAlign = 'center';
  label.innerHTML = 'Text would look like this';

  parent.appendChild(canvas);
  parent.appendChild(label);

  drawColorWheel(canvas);
  onHuePicked(initialHue);

  let xCircle = canvas.width / 2,
    yCircle = canvas.height / 2,
    radius = canvas.width / 2;

  canvas.addEventListener('mousemove', (ev) => {
    let dist = Math.sqrt(
      Math.pow(ev.offsetX - xCircle, 2) + Math.pow(ev.offsetY - yCircle, 2)
    );
    canvas.style.cursor = dist <= radius ? 'crosshair' : 'default';
  });

  canvas.addEventListener('mousedown', (ev) => {
    if (ev.button != 0) {
      return;
    }

    let dist = Math.sqrt(
      Math.pow(ev.offsetX - xCircle, 2) + Math.pow(ev.offsetY - yCircle, 2)
    );

    if (radius < dist) {
      return;
    }

    let sine = (yCircle - ev.offsetY) / dist,
      radians = Math.atan2(yCircle - ev.offsetY, ev.offsetX - xCircle);

    if (radians < 0) {
      radians = 2 * Math.PI - Math.abs(radians);
    }

    let degrees = (radians * 180) / Math.PI,
      hue = Math.round(degrees);

    onHuePicked(hue);
  });

  function onHuePicked(hue) {
    label.style.backgroundColor = `hsl(${hue}, 100%, 70%)`;
    if (callback) {
      callback(hue);
    }
  }

  function drawColorWheel(canvas) {
    let ctx = canvas.getContext('2d'),
      radius = canvas.width / 2,
      x = canvas.width / 2,
      y = canvas.height / 2;

    for (let i = 0; i < 360; i++) {
      let color = `hsl(${i}, 100%, 50%)`;

      ctx.beginPath();

      ctx.moveTo(x, y);
      ctx.arc(x, y, radius, (-(i + 1) * Math.PI) / 180, (-i * Math.PI) / 180);
      ctx.lineTo(x, y);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.strokeStyle = color;

      ctx.fill();
      ctx.stroke();
    }
  }
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