// CSS Classes
// Design stuff
GlobalStyle.newClass("file-folder::before", "content:'📁';"); // TODO Replace with nice graphics
GlobalStyle.newClass("file-documents::before", "content:'📝 ';"); // TODO Replace with nice graphics
GlobalStyle.newClass("file-applications::before", "content:'💾 ';"); // TODO Replace with nice graphics
GlobalStyle.newClass("file-downloads::before", "content:'⬇ ';"); // TODO Replace with nice graphics
GlobalStyle.newClass("file-desktop::before", "content:'🖥 ';"); // TODO Replace with nice graphics

/**
 * The class which holds the interface for the file viewer.
 */
class FileViewer {
    constructor() {

    }
    /**
     * Open a new file viewer <strong>window</strong> at the given path.
     * @param {String} path - The path for the window to be opened under. Errors will occur if this is invalid, so make sure to validate it first.
     */
    openFolderWindow(path) {
        let win = new Window(273, 290, path, 41, 35, { topBarCreator: this.createTopBar, thisContext: this });
        this.window = win.getWindow();
        this.header = win.getHeader();
        this.win = win;
        this.currentFolder = path;
        this.win.setBackgroundColor("rgba(0,0,0,0)");

        // Back Button
        let back = document.createElement("div");
        back.classList.add("file-back-container", "unselectable", "no-move");

        let backImg = document.createElement("img");
        backImg.classList.add("file-back");
        backImg.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTMuMDI1IDFsLTIuODQ3IDIuODI4IDYuMTc2IDYuMTc2aC0xNi4zNTR2My45OTJoMTYuMzU0bC02LjE3NiA2LjE3NiAyLjg0NyAyLjgyOCAxMC45NzUtMTF6Ii8+PC9zdmc+";
        back.appendChild(backImg);

        this.header.insertBefore(back, win.getHeaderText());

        this.back = back;
        this.back.onclick = ()=>{this.goBackParent();};

        this.win.setTitle(path);

        this.contentContainer = document.createElement("div");
        this.contentContainer.style.height = "calc(100% - 1em)";
        this.contentContainer.style.display = "flex";
        this.window.appendChild(this.contentContainer);

        // background (for right click menu/scrolling) cannot be inside display folders function or will be needlessly created and overwritten
        this.background = document.createElement("div");
        this.background.style.backgroundColor = "#fff";
        this.background.style.flexGrow = "1";
        this.background.style.overflowY = "auto"; // scrolling
        this.background.style.overflowX = "hidden"; // scrolling
        this.background.setAttribute("path", this.currentFolder);
        this.background.classList.add("background-drop");

        // Right Click
        this.generatedWindow = this.win.makeString();
        this.addRightClickMenu();

        // Folder Display
        this.displayFolders(path);
        
        // Sidebar
        this.createSidebar();
        this.window.addEventListener('window-resize', (event)=>{
            if(this.window.clientWidth/em < 27) {
                if(this.sidebar) {
                    this.destroySidebar();
                }
            } else {
                if(!this.sidebar) {
                    this.createSidebar();
                }
            }
        });

        this.background.addEventListener("file-system-change", ()=>{
            this.openFolder(this.currentFolder);
        });

        this.addBoxSelection();
        this.addSystemUpdateListeners();
    }

    addRightClickMenu() {
        // icon right click
        RightClickMenu.addToMenu("Open", [this.generatedWindow+"-folder", this.generatedWindow+"-file", this.generatedWindow+"-trash", this.generatedWindow+"-app"], this.openSelected.bind(this));
        
        RightClickMenu.addToMenu("Open in New Window", [this.generatedWindow+"-folder", this.generatedWindow+"-trash"], ()=>{
            var selected = document.querySelectorAll(".icon-selected");
            selected.forEach((element)=>{
                let tmp = new FileViewer;
                tmp.openFolderWindow(element.getAttribute("path"));
            });
        });

        RightClickMenu.addLineToMenu([this.generatedWindow+"-folder", this.generatedWindow+"-file", this.generatedWindow+"-trash", this.generatedWindow+"-app"]); // breaking line

        RightClickMenu.addToMenu("Move To Trash", [this.generatedWindow+"-folder", this.generatedWindow+"-file", this.generatedWindow+"-app"], this.moveSelectedToTrash.bind(this));

        RightClickMenu.addToMenu("Empty Trash", [this.generatedWindow+"-trash"], ()=>{
            let subs = folders[trashPath].subfolders;
            subs.forEach((path)=>{
                FileSystem.deleteFolderAtLocation(path);
            });
            folders[trashPath].subfolders = []; // remove old subfolders
        });

        RightClickMenu.addLineToMenu([this.generatedWindow+"-folder", this.generatedWindow+"-file", this.generatedWindow+"-trash", this.generatedWindow+"-app"]); // breaking line
        
        RightClickMenu.addToMenu("Rename", [this.generatedWindow+"-folder", this.generatedWindow+"-file"], this.rename.bind(this));
        
        RightClickMenu.addLineToMenu([this.generatedWindow+"-folder", this.generatedWindow+"-file"]);

        RightClickMenu.addToMenu("Copy", [this.generatedWindow+"-folder", this.generatedWindow+"-file", this.generatedWindow+"-app"], this.copyFiles.bind(this));
        RightClickMenu.addToMenu("Cut", [this.generatedWindow+"-folder", this.generatedWindow+"-file", this.generatedWindow+"-app"], this.cutFiles.bind(this));
        RightClickMenu.addToMenu("Paste", [this.generatedWindow+"-folder", this.generatedWindow+"-file", this.generatedWindow, this.generatedWindow+"-app"], this.pasteFiles.bind(this));

        RightClickMenu.addLineToMenu([this.generatedWindow+"-folder", this.generatedWindow+"-file", this.generatedWindow+"-app"]); // breaking line

        RightClickMenu.addToMenu("Add Folder", [this.generatedWindow, this.generatedWindow+"-icon", this.generatedWindow+"-folder", this.generatedWindow+"-file", this.generatedWindow+"-trash", this.generatedWindow+"-app"], ()=>{ this.makeNewFolder(); });
        RightClickMenu.addToMenu("Upload Files", [this.generatedWindow, this.generatedWindow+"-icon", this.generatedWindow+"-folder", this.generatedWindow+"-file", this.generatedWindow+"-trash", this.generatedWindow+"-app"], ()=>{ this.uploadNewFile(); });
        RightClickMenu.addToMenu("DEBUG: Create File", [this.generatedWindow, this.generatedWindow+"-icon", this.generatedWindow+"-folder", this.generatedWindow+"-file", this.generatedWindow+"-trash", this.generatedWindow+"-app"], async ()=>{
            alert("Note: Apps cannot be added via this.");
            let filename = await prompt("Filename (with extension):");
            let filedata = await prompt("Filedata (if any):");
            let filekind = await prompt("Filekind:");
            this._addFileToStorage(filename, filedata, filekind);
        });
        RightClickMenu.addRightClickForWindow(this.background, this.generatedWindow, true);
    }

    createTopBar() {
        // FILE
        TopBar.addToTop("File", "file");

        TopBar.addToMenu("New Window", "file", ()=>{
            this.openFolderWindow("/Users/"+NAME+"/");
        });

        let newSelect = TopBar.addToMenu("New  ▶", "file", undefined, {clickable: false});
        TopBar.addSecondaryListenerForItem({el: newSelect, name:"newSelect"});
        TopBar.addToMenu("Folder", "newSelect", ()=>{ this.makeNewFolder() });
        TopBar.addToMenu("File", "newSelect", ()=>{ console.log("New File!"); });
        TopBar.addLineToMenu("file");
        TopBar.addToMenuIf(()=>{
            // returns true if anything is selected, false if not.
            let selected = this.window.querySelector(".icon-selected");
            return !!selected;
        }, "Open Selection", "file", this.openSelected.bind(this));

        TopBar.addToMenu("Close Window", "file", ()=>{ this.win.close(); });
        // END FILE

        // EDIT
        TopBar.addToTop("Edit", "edit");
        TopBar.addToMenu("Undo", "edit", ()=>{ console.log("Undo not implemented"); });
        TopBar.addToMenu("Redo", "edit", ()=>{ console.log("Redo not implemented"); });
        TopBar.addLineToMenu("edit");
        TopBar.addToMenuIf(()=>{this.background.querySelector(".icon-selected")}, "Cut", "edit", this.cutFiles.bind(this), {thisContext: this});
        TopBar.addToMenu("Copy", "edit", this.copyFiles.bind(this));
        TopBar.addToMenuIf(()=>{
            return Clipboard.contents[0] == "file-list";
        }, "Paste", "edit", this.pasteFiles.bind(this));
        TopBar.addLineToMenu("edit");
        TopBar.addToMenu("Select All", "edit", ()=>{
            let files = this.window.querySelectorAll(".icon-container");
            files.forEach((element)=>{
                element.classList.add("icon-selected");
            });
        });
        // END EDIT

        // HELP
        TopBar.addToTop("Help", "help");
        TopBar.addToMenu("About File Viewer", "help", ()=>{
            About.newWindow("File Viewer", "The official file viewer for WebSystem.", "1.0", "assets/folder.png");
        });
        // END HELP
    }

    createSidebar() {
        this.sidebar = document.createElement("div");
        this.sidebar.classList.add("heavy-blurred", "file-sidebar", "unselectable");

        // heading 1
        let favorites = document.createElement("file-heading");
        favorites.classList.add("ellipsis-overflow", "unselectable");
        favorites.innerHTML = "Favorites";
        this.sidebar.appendChild(favorites);

        let favoritesDiv = document.createElement("div");
        this.sidebar.appendChild(favoritesDiv);

        // heading 1 content
        let documents = document.createElement("file-member");
        documents.classList.add("ellipsis-overflow", "file-documents", "clickable", "unselectable");
        documents.innerHTML = "Documents";
        documents.setAttribute("path", "/Users/"+NAME+"/Documents/");
        favoritesDiv.appendChild(documents);
        
        let applications = document.createElement("file-member");
        applications.classList.add("ellipsis-overflow", "file-applications", "clickable", "unselectable");
        applications.innerHTML = "Applications";
        applications.setAttribute("path", "/Users/"+NAME+"/Applications/");
        favoritesDiv.appendChild(applications);

        let downloads = document.createElement("file-member");
        downloads.classList.add("ellipsis-overflow", "file-downloads", "clickable", "unselectable");
        downloads.innerHTML = "Downloads";
        downloads.setAttribute("path", "/Users/"+NAME+"/Downloads/");
        favoritesDiv.appendChild(downloads);

        let desktop = document.createElement("file-member");
        desktop.classList.add("ellipsis-overflow", "file-desktop", "clickable", "unselectable");
        desktop.innerHTML = "Desktop";
        desktop.setAttribute("path", "/Users/"+NAME+"/Desktop/");
        favoritesDiv.appendChild(desktop);

        let folder1 = document.createElement("file-member");
        folder1.classList.add("ellipsis-overflow", "file-folder", "clickable", "unselectable");
        folder1.innerHTML = "WebSystem";
        folder1.setAttribute("path", "/Users/"+NAME+"/Desktop/WebSystem/");
        favoritesDiv.appendChild(folder1);

        let favoritedElements = favoritesDiv.querySelectorAll("file-member");
        if(favoritedElements) {
            favoritedElements.forEach((element)=>{
                // selection
                if(element.innerHTML == folders[this.currentFolder].name) {
                    element.classList.add("file-member-selected");
                }

                // Click handling
                element.onclick = (event)=>{
                    this.openFolder(element.getAttribute("path"));
                }

            });
        }

        this.contentContainer.insertBefore(this.sidebar, this.background);
    }
    destroySidebar() {
        this.sidebar.remove();
        this.sidebar = undefined; // unbind
    }
    recursiveAddFromObject(children, parent, object) {
        children.forEach((child)=>{
            if(!child.reference.isFile) { // folder
                this._addFolderToDifferentLocation(child.name, parent);
                if(object[child.name]) {
                    this.recursiveAddFromObject(object[child.name], parent+child.name+"/", object);
                }
            } else { // file
                // get value and set data to it.
                let data = child.data;
                this._addFileToDifferentLocation(child.name, data, child.reference.kind, parent);
            }
            // }
        });
    }
    moveSelectedToTrash() {
        let selected = mainContent.querySelectorAll(".icon-selected");
        selected.forEach((element)=>{
            this.background.removeChild(element);
            FileSystem.moveFile(element.getAttribute("path"), trashPath);
        });
    }
    rename() {
        // input
        let selected = this.background.querySelector(".icon-selected");
        let oldPath = selected.getAttribute("path");
        let oldName = selected.getAttribute("name");

        // interface
        selected.classList.add("icon-selected", "icon-rename");
        let text = selected.querySelector("div");
        let invisibleInput = document.createElement("input");
        invisibleInput.style.opacity = "0";
        invisibleInput.style.textAlign = "center";
        invisibleInput.style.width = "8.5em";
        invisibleInput.style.fontSize = "1em";
        invisibleInput.style.height = "1.5em";
        let pos = text.getBoundingClientRect();
        invisibleInput.style.position = "absolute";
        invisibleInput.style.zIndex = selected.parentNode.parentNode.parentNode.style.zIndex + 1;
        invisibleInput.style.left = pos.left+"px";
        invisibleInput.style.top = pos.top+"px";
        invisibleInput.style.transform = "translate(-12.8%, -6%)";
        if(folders[oldPath].isFile && folders[oldPath].extension) {
            invisibleInput.value = oldName.replace(folders[oldPath].extension, "");
        } else {
            invisibleInput.value = oldName;
        }
        document.body.appendChild(invisibleInput);

        setTimeout(()=>{
            invisibleInput.focus(); // wait for object to be made
            invisibleInput.setSelectionRange(0, invisibleInput.value.length);
            if(folders[oldPath].isFile && folders[oldPath].extension) {
                invisibleInput.value += folders[oldPath].extension;
                invisibleInput.setSelectionRange(0, invisibleInput.value.length - folders[oldPath].extension.length);
            }
        }, 50);
        
        invisibleInput.onkeyup = ()=>{
            text.innerText = invisibleInput.value;
        }

        invisibleInput.onkeydown = (event)=>{
            if(event.key == "Enter") {
                invisibleInput.blur();
            }
        }

        invisibleInput.onblur = ()=>{
            let txt = text.innerText;
            if(txt === "") {
                txt = "untitled";
            }
            let path = this.currentFolder+txt+"/";
            if(Object.keys(folders).includes(path)) {
                let i = 2;
                while(Object.keys(folders).includes(path)) {
                    text.innerText = txt+" "+i;
                    i++;
                    path = this.currentFolder+text.innerText+"/";
                }
            }
            invisibleInput.remove();
            selected.classList.remove("icon-rename");
            
            let newName = text.textContent;

            selected.setAttribute("path", path);
            selected.setAttribute("name", newName);

            this.shownSubfolders.splice(this.shownSubfolders.indexOf(oldPath), 1, path);


            selected.querySelector("div").textContent = newName;

            // actually changing stuff
            FileSystem.renameAny(oldPath, path, newName);
        }
    }
    copyFiles() {
        let selected = document.querySelectorAll(".icon-selected");
            let copy = [];
            selected.forEach((element)=>{
                let filename = element.getAttribute("name");
                let filepath = element.getAttribute("path");
                if(!folders[filepath].isFile) {
                    // file is a folder
                    copy.push(this.getChildren(filepath, filename));
                } else {
                    // file is a file
                    copy.push({"file": true, "filename": "Copy of "+filename, "data":files[filepath], kind:folders[filepath].kind});
                }
                
            });
            Clipboard.contents = ["file-list", copy];
    }
    cutFiles() {
        // copy
        this.copyFiles();
        // remove
        this.moveSelectedToTrash();
    }
    pasteFiles() {
        let contents = Clipboard.contents;
        if(contents[0] == "file-list") {
            contents.shift();
            contents = contents[0];
            contents.forEach((element)=>{
                // "element" is an object in the form:
                //  { top: "topmost", subs:[{sub object 1}, {sub object 2}], sub1: ["sub2"]}
                if(element["file"]) { // is file
                    this._addFileToStorage(element.filename, element.data, element.kind);
                } else { // is folder (note that folders can contain files)
                    let num = 2;
                    let path = this.currentFolder+element["top"];
                    let oldPath = path;
                    let oldName = element["top"];
                    if(!folders[path]) {
                        path += "/";
                    }
                    while(folders[path]) { // already exists
                        path = oldPath+" "+num+"/";
                        element["top"] = oldName+" "+num;
                        console.warn("Warning caught in fileViewer, there is already a folder with path "+path+"."+"Changed to "+path);
                        num++;
                    }

                    this._addFolderToStorage(element["top"]);
                    let subs = element["subs"];
                    this.recursiveAddFromObject(subs, path, element);
                }
            });
            contents = [contents];
            contents.unshift("file-list");
            Clipboard.contents = contents;
        }
    }
    openSelected() {
        // used in right click menu and top bar to open files
        var selected = document.querySelectorAll(".icon-selected");
        let names = [];
        selected.forEach((element)=>{
            names.push(element.getAttribute("path"));
        });
        this.intelligentOpen(names);
    }
    addBoxSelection() {
        var box = document.createElement("div");
        box.style.display = "none";
        var width = 0;
        var height = 0;
        box.classList.add("file-box-selection");
        this.background.appendChild(box);
        this.background.addEventListener("mousedown", (event)=>{
            if(event.target == this.background && event.button == 0) { // prevent on folders
                box.style.display = "block";
                box.style.left = event.x+"px";
                left = event.x;
                box.style.top = event.y+"px";
                top = event.y;
                document.body.style.cursor = "default";
                document.body.classList.add("unselectable");
                isShown = true;

                // disable pointer events on all windows
                document.querySelectorAll(".window").forEach((element)=>{
                    if(element != this.window) {
                        element.style.pointerEvents = "none";
                    }
                });
            }
        });
        var left = 0;
        var top = 0;
        var isShown = false;

        document.addEventListener("mousemove", (event)=>{
            if(isShown) {
                 // Below is from 1st comment on https://stackoverflow.com/a/48970682. It returns true if the left mouse button is down, regardless of the other buttons.
                if(event.buttons & 1 === 1) {
                    width = Math.abs(event.x - left);
                    height = Math.abs(event.y - top);

                    // window.requestAnimationFrame causes an issue with fast mouse movements, so less performance it is.
                    let backgroundRect = this.background.getBoundingClientRect();
                    let boxRect = box.getBoundingClientRect();
                    if(boxRect.left + width <= backgroundRect.right - event.movementX && boxRect.right - width >= backgroundRect.left - event.movementX) {
                        box.style.width = width+"px";
                        if(event.x < left) { // inspired by http://jsfiddle.net/RSYTq/34/ 
                            box.style.left = event.x+"px";
                        }
                    }

                    if(boxRect.top + height <= backgroundRect.bottom - event.movementY && boxRect.bottom - height >= backgroundRect.top - event.movementY) {
                        box.style.height = height+"px";
                        if(event.y < top) { // inspired by http://jsfiddle.net/RSYTq/34/ 
                            box.style.top = event.y+"px";
                        }
                    }
                    let divider = 1.1;
                    this.background.childNodes.forEach((node)=>{
                        if(node.classList.contains("icon-container")) {
                            let rect = node.getBoundingClientRect();
                            let w = rect.right - rect.left;
                            let h = rect.bottom - rect.top;
                            if((rect.left + w/divider >= boxRect.left && rect.right - w/divider <= boxRect.right && rect.top + h/divider >= boxRect.top && rect.bottom - h/divider <= boxRect.bottom) && !node.classList.contains("icon-selected")) {
                                node.classList.add("icon-selected");
                            } else if(!event.shiftKey && node.classList.contains("icon-selected") && !(rect.left + w/divider >= boxRect.left && rect.right - w/divider <= boxRect.right && rect.top + h/divider >= boxRect.top && rect.bottom - h/divider <= boxRect.bottom)) {
                                // remove it if it is no longer in the box
                                node.classList.remove("icon-selected");
                            }
                        }
                    });
                }
            }
           
        });

        document.addEventListener("mouseup", ()=>{ // the document because the mouseup doesn't have to occur on the background
            if(isShown) {
                isShown = false;
                box.style.display = "none";
                width = 0;
                height = 0;
                box.style.width = width+"px";
                box.style.height = height+"px";
                document.body.style.cursor = "auto";
                document.body.classList.remove("unselectable");
                // disable pointer events on all windows
                document.querySelectorAll(".window").forEach((element)=>{
                    if(element != this.window) {
                        element.style.pointerEvents = "initial";
                    }
                });
            }
        });
    }
    addSystemUpdateListeners() {
        document.addEventListener("file-system-update", (event)=>{
            if(event.parentPath == this.currentFolder) {
                let { type, pathAffected, renameOldPath } = event.actions;
                let fRef = folders[pathAffected];

                if(type == "add" && !this.shownSubfolders.includes(pathAffected)) { // if adding and it doesn't exist
                    fRef = folders[pathAffected];
                    if(!fRef.isFile) {
                        this.createFolder(fRef.name, pathAffected, !this.win, true);
                    } else {
                        this.createFile(fRef.name, pathAffected, fRef.kind, true);
                    }
                    this.shownSubfolders.push(pathAffected);                    
                } else if(type == "remove" && this.shownSubfolders.includes(pathAffected)) { // if removing and it does exist
                    let subs = this.background.querySelectorAll(".icon-container");
                    subs.forEach((e)=>{ // remove if is affected
                        if(e.getAttribute("path") == pathAffected) {
                            e.remove();
                        }
                    });
                    this.shownSubfolders.splice(this.shownSubfolders.indexOf(pathAffected), 1);
                } else if(type == "rename" && this.shownSubfolders.includes(renameOldPath)) {

                    // TODO: Change this so that it does not delete and re-add. Make it so that it *changes* the element e that is removed after the if statement instead of removing it and re adding its renamed version

                    let subs = this.background.querySelectorAll(".icon-container");
                    subs.forEach((e)=>{ // remove if is affected
                        if(e.getAttribute("path") == renameOldPath) {
                            e.remove();
                        }
                    });
                    this.shownSubfolders.splice(this.shownSubfolders.indexOf(renameOldPath), 1);


                    fRef = folders[pathAffected];
                    if(!fRef.isFile) {
                        this.createFolder(fRef.name, pathAffected, !this.win, true);
                    } else {
                        this.createFile(fRef.name, pathAffected, fRef.kind, true);
                    }
                    this.shownSubfolders.push(pathAffected);
                }
            } else if(event.actions.type == "remove" && event.actions.pathAffected == this.currentFolder) {
                this.win.close();
            }
        });
    }
    /**
     * <strong>Change</strong> the current fileViewer's window to be the path provided.
     * @param {String} path - The path for the window to be opened under. Errors will occur if this is invalid, so make sure to validate it first.
     */
    openFolder(path) {
        this.currentFolder = path;
        this.win.clear();
        this.win.setTitle(path);
        // clear past screen
        this.contentContainer.innerHTML = "";
        this.background.innerHTML = "";
        this.background.setAttribute("path", this.currentFolder);

        this.contentContainer = document.createElement("div");
        this.contentContainer.style.height = "calc(100% - 1em)";
        this.contentContainer.style.display = "flex";
        this.window.appendChild(this.contentContainer);

        this.displayFolders(path);
        this.createSidebar();
        this.addBoxSelection();
    }
    displayFolders(path) {
        // background (for right click menu)
        this.contentContainer.appendChild(this.background);
        // Deselection
        this.background.onmousedown = (event)=>{ // not window to save on events
            if(event.target == this.background && !event.shiftKey) {
                clearSelected();
            }
        }

        this.shownSubfolders = [];
        
        if(folders[path]) { // has something
            folders[path].subfolders.forEach(subPath =>{
                let name = folders[subPath].name;
                if(folders[subPath].isFile) { // is file
                    switch(folders[subPath].kind) {
                        case "Image":
                        case "App":
                        case "Music":
                        case "Text":
                            this.createFile(name, subPath, folders[subPath].kind);
                            break;
                        default:
                            console.warn("Could not find file extension of file:");
                            console.log(name);
                            this.createFile(name, subPath, "Unknown");
                            break;
                    }
                } else { // is folder
                    this.createFolder(name, subPath, false);
                }
            });
        }
    }
    /**
     * Add a folder to the screen in the current window
     * @param {String} name - The name of the folder to be made. If an empty string will be auto determined from path
     * @param {String} path - The path to the parent of the folder to be created at.
     * @param {Boolean} [newWindow=true] - If true, creates a new window on open.
     * @param {Boolean} [before=false] 
     */
    createFolder(name="", path=this.currentFolder, newWindow=true, before=false) {
        this.shownSubfolders.push(path);
        
        let newFolderContainer = document.createElement("div");
        newFolderContainer.classList.add("clickable", "icon-container", "folder"); // ? class desktop-folder
        if(name === "") {
            name = folders[path].name;
        }
        newFolderContainer.setAttribute("path", path);
        newFolderContainer.setAttribute("name", name);
        newFolderContainer.draggable = true; // even though draggable is enumerated, in js it still has to be like this. ???
        // newFolderContainer.id = name;
        if(before == true) {
            this.background.insertBefore(newFolderContainer, this.background.firstChild);
        } else {
            this.background.appendChild(newFolderContainer);
        }

        // img
        let newFolder = document.createElement("img");
        if(folders[path] && folders[path].isTrash) {
            if(folders[path].subfolders.length != 0) {
                newFolder.src = "assets/trash.png";
            } else {
                newFolder.src = "assets/emptyTrash.png";
            }
            newFolder.classList.add("trash-can");
            if(trashPath != path) {
                trashPath = path;
            }
            newFolderContainer.draggable = false;
        } else {
            newFolder.src = "assets/folder.png";
        }
        newFolder.classList.add("icon", "unselectable", "folder-img");
        newFolder.draggable = false;
        newFolderContainer.appendChild(newFolder);
    
        // text
        let text = document.createElement("div");
        text.classList.add("sans-serif", "unselectable");
        text.draggable = false; 
        text.innerText = name;
        newFolderContainer.appendChild(text);

        if(!this.win) { // desktop
            text.classList.add("desktop-text");
        }
    
        // double vs single click logic
        // var previousSelection;

        newFolderContainer.ondblclick = (event)=>{
            if(newWindow == true) {
                let n = new FileViewer;
                n.openFolderWindow(newFolderContainer.getAttribute("path"));
            } else {
                this.openFolder(newFolderContainer.getAttribute("path"));
            }
            // if(previousSelection) {
            //     previousSelection.forEach((element)=>{
            //         if(element != newFolderContainer) {
            //             this.intelligentOpen(element.getAttribute("path"));
            //         }
            //         if(!element.classList.contains("icon-selected")) {
            //             element.classList.add("icon-selected");
            //         }
            //     });
            //     previousSelection = null;
            // }
        }

        // select
        newFolderContainer.onclick = function(event) {
            if(event.detail === 1) { // only run if single click
                // previousSelection = document.querySelectorAll(".icon-selected");
                selectElement(event, newFolderContainer);
                // setTimeout(()=>{
                //     previousSelection = null; // prevent weird stuff
                // }, 250);
            }
        }

        newFolderContainer.addEventListener('contextmenu', ()=>{
            // unselect all folders that aren't in the current window
            this.unselectNotInView();

            selectElement(event, newFolderContainer, false);
        });
        if(!this.disableRightClick) {
            if(folders[path] && folders[path].isTrash) {
                RightClickMenu.addContextMenuListener(newFolderContainer, this.generatedWindow+"-trash");
            } else {
                RightClickMenu.addContextMenuListener(newFolderContainer, this.generatedWindow+"-folder");
            }
        }
        return newFolderContainer; // allows for adding to lists
    }
    /**
     * Add a file to the screen.
     * @param {String} name - The name of the file
     * @param {String} path - The path of the file
     * @param {String} filetype - The filetype of the file. e.g. 'Image' or 'Music'.
     * @param {Boolean} [before=false] - Whether to appendChild or insertBefore
     */
    createFile(name, path, filetype, before=false) {
        this.shownSubfolders.push(path);

        let newFileContainer = document.createElement("div");
        newFileContainer.classList.add("clickable", "icon-container", "file");
        newFileContainer.setAttribute("path", path);
        newFileContainer.setAttribute("name", name);
        newFileContainer.draggable = true;
        if(before) {
            this.background.insertBefore(newFileContainer, this.background.firstChild);
        } else {
            this.background.appendChild(newFileContainer);
        }
        
    
        // img
        let newFile = document.createElement("img");
        if(filetype=="Image") {
            newFile.src = "assets/image.png";
            // Poor man's lazy loading
            let thumbed = newFile.cloneNode();
            thumbed.classList.add("icon", "unselectable");
            thumbed.draggable = false;
            thumbed.onload = ()=>{
                newFileContainer.replaceChild(thumbed, newFile);
            }
            try {
                if(!objectURLS[path]) { // if there is not already an object url for that path, then make one. this prevents memory leaks (though memory leaks still can happen if the files are moved)
                    let url = URL.createObjectURL(files[path]);
                    objectURLS[path] = url;
                }
                thumbed.src = objectURLS[path];
            } catch(e) {
                console.error("There was an issue loading the thumbnail. The file "+path+" may be corrupted.");
            }
        } else if(filetype=="App"){
            if(appImagePaths[name]) {
                newFile.src = appImagePaths[name];
            } else {
                newFile.src = "assets/unknown.png";
            }
            newFileContainer.classList.remove("file");
            newFileContainer.classList.add("app");
        } else if(filetype == "Music") {
            if(folders[path].content.mediaTags) { // use thumbnail
                newFile.src = Music.getThumbnail(folders[path].content.mediaTags);
            } else {
                newFile.src = "assets/music.png";
            }
        } else if(filetype == "Text") {
            let content = folders[path].content;
            // convert content to image
            let canvas = document.createElement("canvas");
            var tCtx = canvas.getContext('2d'); // Hidden canvas
            
            // Text input element
            tCtx.canvas.width = tCtx.measureText(content).width <= 150 ? tCtx.measureText(content).width : 150;
            // tCtx.fillText(content, 10, 10);

            let lineHeight = 10;
            let fitWidth = 150;

            // Wrap text. From https://stackoverflow.com/a/4478894/
            fitWidth = fitWidth || 0;
            
            if(fitWidth <= 0) {
                tCtx.fillText(content, 10, 10);
                return;
            }
            var words = content.split(' ');
            var currentLine = 0;
            var idx = 1;
            while(words.length > 0 && idx <= words.length) {
                var str = words.slice(0,idx).join(' ');
                var w = tCtx.measureText(str).width;
                if (w > fitWidth) {
                    if(idx==1) {
                        idx=2;
                    }
                    tCtx.fillText(words.slice(0,idx-1).join(' '), 10, 10 + (lineHeight*currentLine) );
                    currentLine++;
                    words = words.splice(idx-1);
                    idx = 1;
                } else {
                    idx++;
                }
            }
            if(idx > 0) {
                tCtx.fillText(words.join(' '), 10, 10 + (lineHeight*currentLine));
            }
            newFile.src = tCtx.canvas.toDataURL();
        
            tCtx.globalCompositeOperation = 'destination-over';
            // bg color
            tCtx.fillStyle = "rgba(0,0,0,0.1)";
            tCtx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            newFile.src = "assets/unknown.png";
        }
        newFile.classList.add("icon", "unselectable");
        newFile.draggable = false;
        newFileContainer.appendChild(newFile);
    
        // text
        let text = document.createElement("div");
        text.classList.add("sans-serif", "unselectable");
        text.innerText = name;
        text.draggable = false;
        newFileContainer.appendChild(text);

        if(!this.win) { // desktop
            text.classList.add("desktop-text");
        }
        name = null; // no longer needed, let garbage collect
        path = null;

        // double vs single click logic
        // var previousSelection;

        newFileContainer.ondblclick = (event)=>{
            let path = newFileContainer.getAttribute("path");
            this.intelligentOpen(path);
            // if(previousSelection) {
            //     previousSelection.forEach((element)=>{
            //         if(element != newFileContainer) {
            //             this.intelligentOpen(element.getAttribute("path"));
            //         }
            //         if(!element.classList.contains("icon-selected")) {
            //             element.classList.add("icon-selected");
            //         }
            //     });
            //     previousSelection = null;
            // }
        }


        newFileContainer.onclick = function(event) {
            if(event.detail === 1) { // only run if single click
                // previousSelection = document.querySelectorAll(".icon-selected");
                selectElement(event, newFileContainer);
                // setTimeout(()=>{
                //     previousSelection = null; // prevent weird stuff
                // }, 250);
            }
        }
        newFileContainer.addEventListener("contextmenu", (event)=>{
            // unselect all folders that aren't in the current window
            this.unselectNotInView();

            selectElement(event, newFileContainer, false);
        });
        if(!this.disableRightClick) {
            if(filetype == "App") {
                RightClickMenu.addContextMenuListener(newFileContainer, this.generatedWindow+"-app");
            } else {
                RightClickMenu.addContextMenuListener(newFileContainer, this.generatedWindow+"-file");
            }
        }
        

        return newFileContainer; // allows for adding to lists
    }

    /**
     * Open the file(s) with the specified path.
     * @param {(string|string[])} path - A string or array of strings representing which paths to open.
     */
    intelligentOpen(path) {
        if(typeof path == "object") { // array
            let oldFolder = this.currentFolder;
            path.forEach((n)=>{
                if(oldFolder != this.currentFolder) {
                    this._intelligentOpenOnce(n, true);
                } else {
                    this._intelligentOpenOnce(n);
                }
            });
        } else { // string
            this._intelligentOpenOnce(path);
        }
    }

    // Private
    _intelligentOpenOnce(path, newFolderWindow=false) {
        if(folders[path].kind != "Folder") {
            if(folders[path].kind == "App") {
                try {
                    makeFunctions[folders[path].name]();
                } catch(e) {
                    console.error("No function was provided for making the app named "+folders[path].name+" OR there was an error from creating the app. The error thrown was ", e);
                    
                }
            } else if(folders[path].kind == "Image") {
                new ImageViewer(folders[path].name, path);
            } else if(folders[path].kind == "Music") {
                new Music(folders[path].name, path);
            } else if(folders[path].kind == "Text") {
                new Documenter(folders[path].name, path);
            } else {
                alert("Opened File '"+folders[path].name+"'!");
            }
        } else { // folder
            if(newFolderWindow || !this.win) { // desktop returns true for second
                let n = new FileViewer;
                n.openFolderWindow(path);
            } else {
                this.openFolder(path);
            }
            
        }
    }

    getWindow() {
        return this.window;
    }

    goBackParent() {
        if(folders[this.currentFolder].parent) { // returns false in root directory
            this.openFolder(folders[this.currentFolder].parent);
        }
    }

    // FOLDER/FILE CREATION BY USER
    makeNewFolder() {
        try { // safety
            var blankFolder;
            if(this.win) { // file viewer
                blankFolder = this.createFolder("untitled folder", "", false, true);
            } else { // desktop
                blankFolder = this.createFolder("untitled folder", "", true, true);
            }
            blankFolder.setAttribute("path", this.currentFolder); // prevents opening before made
            blankFolder.setAttribute("name", folders[this.currentFolder].name);
            blankFolder.classList.add("icon-selected", "icon-rename");

            // scroll into view
            this.background.scrollTop = 0;
            this.background.scrollLeft = 0;

            let blankFolderText = blankFolder.querySelector("div");

            let invisibleInput = document.createElement("input");
            invisibleInput.style.opacity = "0";
            invisibleInput.style.width = "8.5em";
            invisibleInput.style.height = "1.5em";
            let pos = blankFolderText.getBoundingClientRect();
            invisibleInput.style.position = "absolute";
            invisibleInput.style.zIndex = blankFolder.parentNode.parentNode.parentNode.style.zIndex + 1;
            invisibleInput.style.left = pos.left+"px";
            invisibleInput.style.top = pos.top+"px";
            invisibleInput.style.transform = "translate(-12.8%, -6%)";
            document.body.appendChild(invisibleInput);
            
            
            setTimeout(()=>{
                invisibleInput.focus(); // wait for object to be made
            }, 50);
            
            invisibleInput.onkeyup = ()=>{
                blankFolderText.innerText = invisibleInput.value;
            }

            invisibleInput.onkeydown = (event)=>{
                if(event.key == "Enter") {
                    invisibleInput.blur();
                }
            }

            invisibleInput.onblur = ()=>{
                let text = blankFolderText.innerText;
                if(text === "") {
                    text = "untitled folder";
                }
                let path = this.currentFolder+text+"/";
                if(Object.keys(folders).includes(path)) {
                    let i = 2;
                    while(Object.keys(folders).includes(path)) {
                        blankFolderText.innerText = text+" "+i;
                        i++;
                        path = this.currentFolder+blankFolderText.innerText+"/";
                    }
                }
                invisibleInput.remove();
                blankFolder.classList.remove("icon-rename");
                blankFolder.setAttribute("path", this.currentFolder+blankFolderText.textContent+"/");
                blankFolder.setAttribute("name", blankFolderText.textContent);
                this.shownSubfolders.splice(this.shownSubfolders.indexOf(""), 1, this.currentFolder+blankFolderText.textContent+"/")
                this._addFolderToStorage(blankFolderText.textContent, false);
            }
        } catch(e) {
            console.error("There was an issue in processing the folder creation. Error:");
            throw e;
        }
    }

    _addFolderToStorage(name, addFolder=true) {
        let oldName = name;
        let path = this.currentFolder+name+"/";
        let num = 2;
        while(folders[path]) { // already exists
            name = oldName+" "+num;
            path = this.currentFolder+name+"/";
            console.warn("Warning caught in fileViewer, There is already a file with path. Changed to "+path+". New name is "+name);
            num++;
        }
        FileSystem.addFolderAtLocation(name, this.currentFolder);
        if(addFolder) { // false on folder make
            this.createFolder("", this.currentFolder+name+"/", !this.win, true);
        }
        this.shownSubfolders.push(path); 
    }

    _addFolderToDifferentLocation(name, parentPath) {
        FileSystem.addFolderAtLocation(name, parentPath);
    }

    _addFileToDifferentLocation(filename, filedata, filekind, filepath) {
        FileSystem.addFileAtLocation(filename, filedata, filekind, filepath);
    }
    /**
     * Add a file to storage. Reads the tags if music.
     * @ignore
     * @private
     * @param {String} filename - The name of the file to be added
     * @param {(Blob|File)} filedata - The data to be added
     * @param {String} filekind - The kind of the file to be added.
     */
    _addFileToStorage(filename, filedata, filekind) {
        let oldName = filename;
        let path = this.currentFolder+filename+"/";
        let num = 2;
        while(folders[path]) { // already exists
            filename = oldName+" "+num;
            path = this.currentFolder+filename+"/";
            console.warn("Warning caught in fileViewer, There is already a file with path. Changed to "+path+". New name is "+filename);
            num++;
        }

        this.shownSubfolders.push(path); 

        if(filekind == "Music") {
            // read tags in worker
            let reader = new Worker("js/getMusicTagsWorker.js");
            reader.postMessage(filedata);
            reader.onmessage = (message)=>{
                let options = message.data;
                FileSystem.addFileAtLocation(filename, filedata, filekind, this.currentFolder, options);
                this.createFile(filename, this.currentFolder+filename+"/", filekind, true);
            }
        } else {
            let prom = FileSystem.addFileAtLocation(filename, filedata, filekind, this.currentFolder);
            if(prom[1]) { // if binary
                prom[1].then(()=>{
                    this.createFile(filename, this.currentFolder+filename+"/", filekind, true);
                });
            } else { // if text based
                prom[0].then(()=>{
                    this.createFile(filename, this.currentFolder+filename+"/", filekind, true);
                });
            }
            
        }
        
        
    }

    /**
     * Allows the user to upload one or more files and will add it to the current folder.
     */
    uploadNewFile() {
        let fileUpload = document.createElement("input");
        fileUpload.type = "file";
        fileUpload.multiple = true;
        fileUpload.click();
        var fileUploadEvent = function namelessName() {
            let files = fileUpload.files;
            files = [...files];
            files.forEach((file)=>{
                let extension = file.name.substring(file.name.lastIndexOf("."), file.name.length).toLowerCase();
                switch(extension) {
                    case ".png":
                    case ".jpg":
                    case ".jpeg":
                    case ".gif":
                    // Add more as image viewer can handle them
                        this._addFileToStorage(file.name, file, "Image");
                        break;
                    case ".mp3":
                    case ".wav":
                    case ".aiff":
                    case ".flac":
                        this._addFileToStorage(file.name, file, "Music");
                        break;
                    default:
                        this._addFileToStorage(file.name, file, "Unknown");
                        break;
                }
               
            });
            fileUpload.removeEventListener('change', fileUploadEvent, false);
        }.bind(this);

        fileUpload.addEventListener('change', fileUploadEvent, false);
        
    }


    getChildren(path, name) {
        let pointerFolder = folders[path];
        let children = [];
        pointerFolder.subfolders.forEach((child)=>{
            children.push({"name": folders[child]["name"], "path": child, reference: folders[child], data: files[child]});
        });
        let finishedObject = { top: name };
        finishedObject["subs"] = children;
        let obj = this.recursiveGetChildren(children, finishedObject);
        obj.top = "Copy of "+obj.top;
        return obj;
    }
    
    recursiveGetChildren(children, finishedObject) {
        children.forEach((child)=>{
            if(child.reference.isFile) { // file
                finishedObject[child.name] = {name: child.name, data: files[child.path], kind: folders[child.path].kind};
            }
            else if(folders[child.path].subfolders) { // folder
                let subfolders = folders[child.path].subfolders.map((p)=>{
                    return {"name": folders[p].name, "path": p, reference: folders[p], data: files[p]};
                });
                finishedObject[child.name] = subfolders;
                
                this.recursiveGetChildren(subfolders, finishedObject);
            }
        });
        return finishedObject;
    }
    /**
     * @ignore
     * Set the value of this.currentFolder. Used ion the desktop class.
     * @param {String} str - The string to have it set to
     */
    setCurrentFolder(str) {
        this.currentFolder = str;
    }

    /**
     * Unselect all files that are in other FileViewer instances
     */
    unselectNotInView() {
        let selected = this.background.querySelectorAll(".icon-selected");
        selected = Array.from(selected);

        let allSelected = document.querySelectorAll(".icon-selected");
        allSelected = Array.from(allSelected);
        
        allSelected = allSelected.filter((element)=>{ // get all selected that aren't in the current window
            return !selected.includes(element);
        });


        allSelected.forEach((element)=>{
            element.classList.remove("icon-selected");
        });
    }
}

/**
 * Select an element
 * @private
 * @ignore
 * @param {Event} event - The click event. Allows for shift key
 * @param {HTMLElement} element
 * @param {Boolean} [shiftCare=true] - If true, if shift is not being held clearSelected() is called.
 */
function selectElement(event, element, shiftCare=true) {
    if(document.querySelectorAll(".icon-selected").length > 0) {
        // shift must be down
        if(event.shiftKey || !shiftCare) {
            element.classList.add("icon-selected");
        } else {
            clearSelected();
            element.classList.add("icon-selected");
        }
    } else {
        // first to be selected
        element.classList.add("icon-selected");
    }
}


var objectURLS = {}; // key is path, value is the object url