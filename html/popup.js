const toggleExtensionOnorOffButton = document.getElementById("toggleExtension");

toggleExtensionOnorOffButton.addEventListener("click", (_event) => {
    chrome.storage.sync.set({extensionStatus: _event.target.checked});
});