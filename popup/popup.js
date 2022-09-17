// variables and constants
const ADDBUTTON_ON_CLASS = "add-btn add-btn-on";
const ADDBUTTON_OFF_CLASS = "add-btn add-btn-off";

// DOM references
const toggleExtensionOnorOffButton = document.getElementById("toggleExtension");
const addNewHighlightBtn = document.getElementById("addHighlight");

var colorsList = [];
var selectedColor = "";
var selectedColorId = "";


window.onload = async () => {
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