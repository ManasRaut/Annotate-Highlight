// set value in storage
function setInStorage(key, value) {
    const data = {};
    data[key] = value;
    chrome.storage.sync.set(data, (result) => {
        console.log(key, "set", value, ":", result);
    });
}

// get value from storage
async function getFromStorage(key) {
    const result = await chrome.storage.sync.get([key]);
    return result;
}