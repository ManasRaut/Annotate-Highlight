chrome.runtime.onInstalled.addListener((_reason) => {
    console.log("Extension Annotate and Highlight started...");

    // remove existing menu items
    chrome.contextMenus.removeAll();
    // add context menus
    chrome.contextMenus.create({ 
        title: 'Turn cursor ON', 
        id: 'toggle-cursor',
    });

    // set default values
    chrome.storage.sync.get(['selectedColor'], (result) => {
        console.log("get", result);
        if (!result?.selectedColor) {
            chrome.storage.sync.set({selectedColor: "tomato"}, (result) => {
                console.log("set", result);
            });
        }
    });
}); 

// handle context menus events
chrome.contextMenus.onClicked.addListener(toggleHighlighter);

// add extension commands
chrome.commands.onCommand.addListener(async (command) => {
    switch (command) {
        case 'toggle-highlighter':
            const tab = await getCurrentTab();
            toggleHighlighter("", tab);
            break;
        default:
            break;
    }
});

// listen messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.task) {
        case "CHANGE_COLOR":
            changeColor(message.data);
            sendResponse({res: "SUCCESS"});
            break;
        default:
            sendResponse({res: "ERROR"});
            break;
    }
});

// get current selected and active tab
async function getCurrentTab() {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    return tabs[0];
}

function toggleHighlighter(info, tab) {
    chrome.tabs.sendMessage( tab.id, {
            task: "TOGGLE_HIGHLIGHTER",
        }, (response) => {
            // update title of context menu accordingly
            if (response.res == "HIGHLIGHTER_TURNED_ON") {
                chrome.contextMenus.update("toggle-cursor", { title: "Turn cursor OFF" });
            } else {
                chrome.contextMenus.update("toggle-cursor", { title: "Turn cursor ON" });
            }
        }
    );
}

// change color
function changeColor(value) {
    chrome.storage.sync.set({ selectedColor: value }, (result) => {
        console.log(result);
    });
}