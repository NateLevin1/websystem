class FileViewer {
    openFolder(open) {
        var win = new Window(100,100,open);
    }
}

function createFolder(x, y, name) {
    let newFolderContainer = document.createElement("div");
    newFolderContainer.classList.add("absolute", "clickable", "icon-container", "desktop-folder");
    newFolderContainer.style.top = y+"em";
    newFolderContainer.style.left = x+"em";
    newFolderContainer.id = name;
    document.body.appendChild(newFolderContainer);

    // img
    let newFolder = document.createElement("img");
    newFolder.src = "assets/folder.png";
    newFolder.classList.add("icon", "unselectable");
    newFolderContainer.appendChild(newFolder);

    // text
    let text = document.createElement("a");
    text.classList.add("white", "sans-serif");
    text.innerText = name;
    newFolderContainer.appendChild(text);
}