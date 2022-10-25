// variables and constants
const ADDBUTTON_ON_CLASS = "add-btn add-btn-on";
const ADDBUTTON_OFF_CLASS = "add-btn add-btn-off";

// DOM references
const toggleExtensionOnorOffButton = document.getElementById("toggleExtension");
const addNewHighlightBtn = document.getElementById("addHighlight");

var colorsList = [];
var selectedColor = "";
var selectedColorId = "";
var highlightsList = [];
var listBox = null;
var tab = "";

window.onload = async () => {
    // get html references
    listBox = document.getElementById("listBox");

    // get url and other details for current tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        tab = tabs[0];
    });

    // get colors from storage, if not present load default colors
    colorsList = DEFAULT_COLORS;
    selectedColor = DEFAULT_COLORS[0];
    selectedColorId = `${DEFAULT_COLORS[0]}Id`;
    let result = await getFromStorage("colorsList");
    if (result.colorsList) {
        colorsList = result.colorsList;
    }

    // create color option for all colors
    colorsList.forEach(c => {
        const newColorOption = document.createElement("div");
        newColorOption.setAttribute("class", "color-button");
        newColorOption.setAttribute("id", `${c}Id`);
        newColorOption.setAttribute("data-color", c);
        newColorOption.style.backgroundColor = c;
        newColorOption.addEventListener("click", changeColor);
        document.getElementsByClassName("color-list")[0].appendChild(newColorOption);
    });

    // and select selected color
    result = await getFromStorage("selectedColor");
    if (result.selectedColor) {
        selectedColor = result.selectedColor;
    }
    selectedColorId = `${selectedColor}Id`;
    document.getElementById(`${selectedColor}Id`).setAttribute("class", "color-button selectedColor");

    await loadAllHighlights();

    // check is highlihghter already on if yes then show it is on
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage( tabs[0].id, {
                task: IS_HIGHLIGHTER_ON,
            }, (response) => {
                if (response.res == HIGHIGHTER_ON) {
                    addNewHighlightBtn.className = ADDBUTTON_ON_CLASS;
                    addNewHighlightBtn.innerText = "Turn off";
                }
            });
        }
    );
}

// toggle highlighter on or off
addNewHighlightBtn.addEventListener("click", (_event) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage( tabs[0].id, {
                task: TOGGLE_HIGHLIGHTER,
            }, (response) => {
                switch(response.res) {
                    case HIGHIGHTER_ON:
                        addNewHighlightBtn.className = ADDBUTTON_ON_CLASS;
                        addNewHighlightBtn.innerText = "Turn off";
                        document.getElementById("error-msg").style.display = "none";
                        break;
                    case HIGHIGHTER_OFF:
                        addNewHighlightBtn.className = ADDBUTTON_OFF_CLASS;
                        addNewHighlightBtn.innerText = "New";
                        document.getElementById("error-msg").style.display = "none";
                        break;
                    case ERROR:
                        document.getElementById("error-msg").style.display = "block";
                        break;
                    default:
                        break;
                }
            }
        );
    });
});

// change color in storage
function changeColor(_event) {
    const newColor = _event.target.dataset.color;
    setInStorage("selectedColor", newColor);    
    document.getElementById(selectedColorId).setAttribute("class", "color-button");
    document.getElementById(_event.target.id).setAttribute("class", "color-button selectedColor");  
    selectedColor = newColor;
    selectedColorId = _event.target.id;
}

// reload all saved highlights
async function loadAllHighlights() {
    while (listBox.firstChild) {
        listBox.removeChild(listBox.firstChild);
    }
    const result = await getFromStorage('highlightsList');
    if (result.highlightsList) {
        let _url = new URL(tab.url);
        highlightsList = result.highlightsList.filter((h, _i) => h.url === _url.hostname + _url.pathname);
    }
    for(let i=0; i<highlightsList.length; i++) {
        const highlightEl = highlightsList[i];
        const listItem = document.createElement("div");
        listItem.classList.add("list-item");
        listItem.setAttribute("data-highlight-id", highlightEl.uuid);
        listItem.innerHTML = `
            <div class="list-colorbox" style="background-color:${highlightEl.color}"></div>
            <div class="list-name">${highlightEl.selectionString}</div>
            <div class="list-options">
                <div class="list-btns copy-h-btn"></div>
                <div class="list-btns delete-h-btn"></div>
            </div>
        `;
        listBox.appendChild(listItem);
    }
    document.querySelectorAll(".copy-h-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const _uuid = button.parentNode.parentNode.getAttribute("data-highlight-id");
            const highlight = highlightsList.find((h, _i) => h.uuid === _uuid);
            navigator.clipboard.writeText(highlight.selectionString);
        });
    });
    document.querySelectorAll(".delete-h-btn").forEach((button) => {
        button.addEventListener("click", () => 
            highlightAction(DELETE_HIGHLIGHT, button.parentNode.parentNode.getAttribute("data-highlight-id")
        ));
    });
}

// listItem event listener
function highlightAction(action, uuid) {
    chrome.tabs.sendMessage( tab.id, {
        task: action,
        uuid: uuid,
    }, (response) => {
        if (response.res === SUCCESS) {
            loadAllHighlights();
        }
    });
}