chrome.runtime.onInstalled.addListener(async (_reason) => {
    console.log("Extension Annotate and Highlight started...");

    // remove existing menu items
    chrome.contextMenus.removeAll();
    // add context menus
    chrome.contextMenus.create({ 
        title: 'Turn highlighter ON', 
        id: 'toggle-cursor',
    });
    chrome.contextMenus.create({ 
        title: 'Add annotation', 
        id: 'add-annotation',
    });

    // set default values
    let result = await getFromStorage("colorsList");
    if (!result.colorsList) {
        setInStorage("colorsList", DEFAULT_COLORS);
    }
    result = await getFromStorage("selectedColor");
    if (!result.selectedColor) {
        setInStorage("selectedColor", DEFAULT_COLORS[0]);
    }
}); 

// handle context menus events
chrome.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case 'toggle-cursor':
            toggleHighlighter(tab);
            break;
        case 'add-annotation':
            addAnnotation(tab);
            break;
        default: break;
    }
});

// add extension commands
chrome.commands.onCommand.addListener(async (command) => {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    const tab = tabs[0];
    switch (command) {
        case 'toggle-highlighter':
            toggleHighlighter(tab);
            break;
        default:
            break;
    }
});

// -------------------util functions------------------------

const SUCCESS = "SUCCESS";
const ERROR = "ERROR";
const TOGGLE_HIGHLIGHTER = "TOGGLE_HIGHLIGHTER";
const HIGHIGHTER_ON = "HIGHLIGHTER_ON";
const HIGHIGHTER_OFF = "HIGHLIGHTER_OFF";
const CHANGE_COLOR = "CHANGE_COLOR";
const ADD_ANNOTATION = "ADD_ANNOTATION";
const DEFAULT_COLORS = ["#ff6347", "#66ff47", "#47b5ff", "#ffc547"];

// set value in storage
function setInStorage(key, value) {
    const data = {};
    data[key] = value;
    chrome.storage.sync.set(data, (result) => {
        // console.log(key, "set", value, ":", result);
    });
}

// get value from storage
async function getFromStorage(key) {
    const result = await chrome.storage.sync.get([key]);
    return result;
}

// send message to turn on highlighter
function toggleHighlighter(tab) {
    chrome.tabs.sendMessage( tab.id, {
            task:  TOGGLE_HIGHLIGHTER,
        }, (response) => {
            // update title of context menu accordingly
            if (response.res == HIGHIGHTER_ON) {
                chrome.contextMenus.update("toggle-cursor", { title: "Turn highlighter OFF" });
            } else {
                chrome.contextMenus.update("toggle-cursor", { title: "Turn highlighter ON" });
            }
        }
    );
}

// send message to add annotation
function addAnnotation(tab) {
    chrome.tabs.sendMessage( tab.id, {
        task:  ADD_ANNOTATION,
    }, (response) => {
        // update title of context menu accordingly
        if (response.res == SUCCESS) {
            chrome.contextMenus.update("add-annotation", { title: "cancel annotation" });
        } else {
            chrome.contextMenus.update("add-annotation", { title: "Add annotation" });
        }
    });
}