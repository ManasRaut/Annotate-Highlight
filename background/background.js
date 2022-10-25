chrome.runtime.onInstalled.addListener(async (_reason) => {
    console.log("Extension Annotate and Highlight started...");

    // remove existing menu items
    chrome.contextMenus.removeAll();
    // add context menus
    chrome.contextMenus.create({ 
        title: 'Turn cursor ON', 
        id: 'toggle-cursor',
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
chrome.contextMenus.onClicked.addListener((info, tab) => toggleHighlighter(tab));

// add extension commands
chrome.commands.onCommand.addListener(async (command) => {
    switch (command) {
        case 'toggle-highlighter':
            const tabs = await chrome.tabs.query({active: true, currentWindow: true});
            const tab = tabs[0];
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
                chrome.contextMenus.update("toggle-cursor", { title: "Turn cursor OFF" });
            } else {
                chrome.contextMenus.update("toggle-cursor", { title: "Turn cursor ON" });
            }
        }
    );
}