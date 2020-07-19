// CSS Classes
// Design stuff
GlobalStyle.newClass("file-folder::before", "content:'📁';"); // TODO Replace with nice graphics
GlobalStyle.newClass("file-documents::before", "content:'📝 ';"); // TODO Replace with nice graphics
GlobalStyle.newClass("file-applications::before", "content:'💾 ';"); // TODO Replace with nice graphics
GlobalStyle.newClass("file-downloads::before", "content:'⬇ ';"); // TODO Replace with nice graphics

class FileViewer {
    openFolderWindow(path) {
        let win = new Window(100, 200, path, 40, 35);
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
        this.background.style.overflow = "auto"; // scrolling

        // Folder Display
        this.displayFolders(path);
        
        // Sidebar
        this.createSidebar();
        this.window.addEventListener('window-resize', event=>{
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

        this.generatedWindow = this.win.makeString();

        // right click menu
        this.rightClickMenu = rightClickMenu;

        // icon right click
        RightClickMenu.addToMenu("Open", [this.generatedWindow+"-folder", this.generatedWindow+"-file"], ()=>{ // required?
            var selected = document.querySelectorAll(".icon-selected");
            let names = [];
            selected.forEach((element)=>{
                names.push(element.getAttribute("path"));
            });
            this.intelligentOpen(names);
        });
        
        RightClickMenu.addToMenu("Open in New Window", this.generatedWindow+"-folder", ()=>{
            var selected = document.querySelector(".icon-selected");
            let n = new FileViewer;
            n.openFolderWindow(selected.getAttribute("path"));
        });

        RightClickMenu.addLineToMenu([this.generatedWindow+"-folder", this.generatedWindow+"-file"]); // breaking line

        RightClickMenu.addToMenu("Move To Trash", [this.generatedWindow+"-folder", this.generatedWindow+"-file"], ()=>{
            console.log("Trash unavailable. 😬");
        });

        RightClickMenu.addLineToMenu([this.generatedWindow+"-folder", this.generatedWindow+"-file"]); // breaking line

        RightClickMenu.addToMenu("Copy", [this.generatedWindow+"-folder", this.generatedWindow+"-file"], ()=>{
            let selected = document.querySelectorAll(".icon-selected");
            let copy = [];
            selected.forEach((element)=>{
                let filename = element.getAttribute("name");
                let filepath = element.getAttribute("path");
                if(element.querySelector("img").src.includes("folder")) {
                    // file is a folder
                    copy.push(this.getChildren(filepath, filename));
                } else {
                    // file is a file
                    copy.push({"file": true, "filename": "Copy of "+filename, "dataPath":filepath});
                }
                
            });
            Clipboard.contents = ["file-list", copy];
        });
        
        RightClickMenu.addToMenu("Paste", [this.generatedWindow+"-folder", this.generatedWindow+"-file", this.generatedWindow], ()=>{
            let contents = Clipboard.contents;
            if(contents[0] == "file-list") {
                contents.shift();
                contents = contents[0];
                contents.forEach((element)=>{
                    // "element" is an object in the form:
                    //  { top: "topmost", subs:[{sub object 1}, {sub object 2}], sub1: ["sub2"]}
                    if(element["file"]) { // is file
                        this._addFileToStorage(element.filename, files[element.dataPath], folders[element.dataPath].kind); // TODO add file kind so it is known
                    } else { // is folder (note that folders can contain files)
                        let num = 2;
                        let path = this.currentFolder+element["top"];
                        let oldPath = path;
                        let oldName = element["top"];
                        if(!folders[path]) {
                            path += "/";
                        }
                        while(folders[path]) { // already exists
                            console.warn("There is already a folder with path "+path);
                            path = oldPath+" "+num+"/";
                            element["top"] = oldName+" "+num;
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
            
        });

        RightClickMenu.addLineToMenu([this.generatedWindow+"-folder", this.generatedWindow+"-file"]); // breaking line

        RightClickMenu.addRightClickForClass(".folder", this.generatedWindow+"-folder", this.background);
        RightClickMenu.addRightClickForClass(".file", this.generatedWindow+"-file", this.background);

        RightClickMenu.addToMenu("Add Folder", [this.generatedWindow, this.generatedWindow+"-icon", this.generatedWindow+"-folder", this.generatedWindow+"-file"], ()=>{ this.makeNewFolder() });
        RightClickMenu.addToMenu("Upload Files", [this.generatedWindow, this.generatedWindow+"-icon", this.generatedWindow+"-folder", this.generatedWindow+"-file"], ()=>{ this.uploadNewFile() });
        RightClickMenu.addRightClickForWindow(this.background, this.generatedWindow, true);
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
        console.log(object);
        children.forEach((child)=>{
            if(!child.reference.isFile) { // folder
                this._addFolderToDifferentLocation(child.name, parent);
                console.log("Added folder "+child.name+" as subfolder of "+parent+".");
                if(object[child.name]) {
                    this.recursiveAddFromObject(object[child.name], parent+child.name+"/", object);
                }
            } else { // file
                // get value at child.path and set data to it.
                let data = files[child.path];
                this._addFileToDifferentLocation(child.name, data, child.reference.kind, parent);
            }
            // }
        });
    }
    openFolder(path) {
        this.currentFolder = path;
        this.win.clear();
        this.win.setTitle(path);
        // clear past screen
        this.contentContainer.innerHTML = "";
        this.background.innerHTML = "";

        this.contentContainer = document.createElement("div");
        this.contentContainer.style.height = "calc(100% - 1em)";
        this.contentContainer.style.display = "flex";
        this.window.appendChild(this.contentContainer);

        this.displayFolders(path);
        this.createSidebar();

        // update right click menu
        // ! I have no idea why this works or how this works. However, only this works. Not the commented out bit below, only this.
        RightClickMenu.addRightClickForClass(".folder", this.generatedWindow+"-folder", this.background);
        RightClickMenu.addRightClickForClass(".file", this.generatedWindow+"-file", this.background);
    }
    displayFolders(path) {
        // background (for right click menu)
        this.contentContainer.appendChild(this.background);
        // Deselection
        this.background.onclick = ()=>{ // not window to save on events
            if(event.target == this.background) {
                clearSelected();
            }
        }
        if(folders[path]) { // has something
            folders[path].subfolders.forEach(element =>{
                let name = folders[element].name;
                if(folders[element].isFile) { // is file
                    switch(folders[element].kind) {
                        case "Image":
                            this.createFile(name, element, "image");
                            break;
                        case "App":
                            this.createFile(name, element, "app");
                            break;
                        default:
                            console.error("Error: Could not find file extension of file:");
                            console.log(name);
                            break;
                    }
                } else { // is folder
                    this.createFolder(name, element, this.background, "black", false);
                }
            });
        }
    }
    /**
     * Create a folder in the current window
     * @param {String} name - The name of the folder to be made.
     * @param {String} path - The path to the parent of the folder to be created at.
     * @param {HTMLElement} appendee - The element to append the folder to.
     * @param {String} color - A CSS Color for the text.
     * @param {Boolean} newWindow - If true, creates a new window on open.
     * @param {Boolean} before 
     */
    createFolder(name, path=this.currentFolder, appendee=this.background, color="black", newWindow=true, before=false) {
        let newFolderContainer = document.createElement("div");
        newFolderContainer.classList.add("clickable", "icon-container", "folder"); // ? class desktop-folder
        newFolderContainer.setAttribute("path", path);
        newFolderContainer.setAttribute("name", name);
        // newFolderContainer.id = name;
        if(before == true) {
            appendee.insertBefore(newFolderContainer, appendee.firstChild);
        } else {
            appendee.appendChild(newFolderContainer);
        }
        
    
        // img
        let newFolder = document.createElement("img");
        newFolder.src = "assets/folder.png";
        newFolder.classList.add("icon", "unselectable");
        newFolderContainer.appendChild(newFolder);
    
        // text
        let text = document.createElement("div");
        text.classList.add(color, "sans-serif");
        text.innerText = name;
        newFolderContainer.appendChild(text);
    
        newFolderContainer.ondblclick = (event)=>{
            if(newWindow == true) {
                var n = new FileViewer;
                n.openFolderWindow(newFolderContainer.getAttribute("path"));
            } else {
                this.openFolder(newFolderContainer.getAttribute("path"));
            }
        }

        // select
        newFolderContainer.onclick = function(event) {
            selectElement(event, newFolderContainer);
        }

        newFolderContainer.oncontextmenu = (event)=>{
            selectElement(event, newFolderContainer);
        }
        return newFolderContainer; // allows for adding to lists
    }
    createFile(name, path, filetype="image", appendee=this.background, color="black") {
        let newFileContainer = document.createElement("div");
        newFileContainer.classList.add("clickable", "icon-container", "file");
        newFileContainer.setAttribute("path", path);
        newFileContainer.setAttribute("name", name);
        appendee.appendChild(newFileContainer);
    
        // img
        let newFile = document.createElement("img");
        if(filetype=="image") {
            newFile.src = "assets/image.png";
        } else if(filetype=="app"){
            if(appImagePaths[name]) {
                newFile.src = appImagePaths[name];
            } else {
                newFile.src = "assets/unknown.png";
            }
        } else {
            newFile.src = "assets/unknown.png";
        }
        newFile.classList.add("icon", "unselectable");
        newFileContainer.appendChild(newFile);
    
        // text
        let text = document.createElement("div");
        text.classList.add(color, "sans-serif");
        text.innerText = name;
        newFileContainer.appendChild(text);
    
        newFileContainer.ondblclick = (event)=>{
            if(filetype == "app") {
                try {
                    makeFunctions[name]();
                } catch(e) {
                    console.error("No function was provided for making the app named "+name+".");
                }
                
            } else if(filetype == "image") {
                new ImageViewer(name, path);
            } else { // unknown filetype
                alert("Opened File "+newFileContainer.getAttribute("name")+"!");
            }
            
        }

        newFileContainer.onclick = function(event) {
            selectElement(event, newFileContainer);
        }
        newFileContainer.oncontextmenu = (event)=>{
            selectElement(event, newFileContainer);
        }

        return newFileContainer; // allows for adding to lists
    }

    /**
     * Open the file wih specified name
     * @param {(string|string[])} name 
     */
    intelligentOpen(name) {
        if(typeof name == "object") { // array
            let oldFolder = this.currentFolder;
            name.forEach((n)=>{
                if(oldFolder != this.currentFolder) {
                    this._intelligentOpenOnce(n, true);
                } else {
                    this._intelligentOpenOnce(n);
                }
            });
        } else { // string
            this._intelligentOpenOnce(name);
        }
    }

    // Private
    _intelligentOpenOnce(name, newFolderWindow=false) {
        if(/\.[^.]+$/.test(name)) { // app
            if(name.endsWith(".app")) {
                try {
                    makeFunctions[name]();
                } catch(e) {
                    console.error("No function was provided for making the app named "+name+".");
                }
                
            } else if(name.endsWith(".png")||name.endsWith(".jpg")||name.endsWith(".jpeg")||name.endsWith(".gif")) {
                new ImageViewer(name);
            } else {
                alert("Opened File "+newFileContainer.getAttribute("name")+"!");
            }
        } else { // folder
            if(newFolderWindow) {
                let n = new FileViewer;
                n.openFolderWindow(name);
            } else {
                this.openFolder(name);
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

    // FOLDER/FILE CREATION
    makeNewFolder() {
        try { // safety
            let blankFolder = this.createFolder("untitled folder", "", this.background, "black", false, true);
            blankFolder.classList.add("icon-selected", "icon-rename");
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
            invisibleInput.style.transform = "translate(5%, 0%)";
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
                if(text.startsWith("file::")||Object.keys(folders).includes(path)) {
                    if(Object.keys(folders).includes(path)) {
                        let i = 2;
                        while(Object.keys(folders).includes(path)) {
                            blankFolderText.innerText = text+" "+i;
                            i++;
                            path = this.currentFolder+blankFolderText.innerText+"/";
                        }
                    } else {
                        blankFolderText.innerText = text.replace(/file::/g, "");
                    }
                }
                invisibleInput.remove();
                blankFolder.classList.remove("icon-rename");
                
                this._addFolderToStorage(blankFolderText.innerText);
                
            }
        } catch(e) {
            console.error("There was an issue in processing the folder creation. Error:");
            throw e;
        }
    }

    _addFolderToStorage(name) {
        FileSystem.addFolderAtLocation(name, this.currentFolder);
        this.openFolder(this.currentFolder);
    }

    _addFolderToDifferentLocation(name, parentPath) {
        FileSystem.addFolderAtLocation(name, parentPath);
    }

    _addFileToDifferentLocation(filename, filedata, filekind, filepath) {
        if(filename.startsWith("file::")) {
            filename = filename.substring(6, filename.length);
        }
        FileSystem.addFileAtLocation(filename, filedata, filekind, filepath);
    }

    _addFileToStorage(filename, filedata, filekind) {
        FileSystem.addFileAtLocation(filename, filedata, filekind, this.currentFolder);
        this.openFolder(this.currentFolder);
    }

    uploadNewFile() {
        let fileUpload = document.createElement("input");
        fileUpload.type = "file";
        fileUpload.click();
        var fileUploadEvent = function namelessName() {
            let files = fileUpload.files;
            files = [...files];
            files.forEach((file)=>{
                let extension = file.name.substring(file.name.lastIndexOf("."), file.name.length);
                switch(extension) {
                    case ".png":
                    case ".jpg":
                    case ".jpeg":
                    case ".gif":
                    // Add more as image viewer can handle them
                        this._addFileToStorage(file.name, file, "Image");
                        break;
                    default:
                        this._addFileToStorage(file.name, file, "Unknown");
                        break;
                }
               
            });
            this.openFolder(this.currentFolder);
            fileUpload.removeEventListener('change', fileUploadEvent, false);
            // var file = fileUpload.files[0];

            // // First, add the file as a sub file of the parent.
            // let currentFolders = localStorage.getItem('folders');
            // localStorage.setItem('folders', currentFolders.replace(this.currentFolder+"]{", this.currentFolder+"]{file::"+file.name+","));
            // // Next, add the data  of the file (not just the name as in previous step to localStorage (key 'files').
            // var currentFiles = localStorage.getItem('files');
            // var extension = file.name.substring(file.name.lastIndexOf("."), file.name.length);
            // if(extension == ".png") {
            //     Base64Image.fileToBase64(fileUpload, (filedata)=>{
            //         localStorage.setItem('files', currentFiles+"["+file.name+"]{"+filedata+"}");
            //         // add data to file
            //         files[file.name] = filedata;
            //     });
            // }
            
            // // Finally, add the file to folders{} so it will display
            // folders[this.currentFolder].unshift("file::"+file.name); // ? push? It looks different after the page has been reloaded if push is used
            // // And update the screen.
            // this.previous.pop();
        }.bind(this);

        fileUpload.addEventListener('change', fileUploadEvent, false);
        
    }


    getChildren(path, name) {
        let pointerFolder = folders[path];
        let children = [];
        pointerFolder.subfolders.forEach((child)=>{
            children.push({"name": folders[child]["name"], "path": child, reference: folders[child]});
        });
        let finishedObject = { top: name };
        finishedObject["subs"] = children;
        let obj = this.recursiveGetChildren(children, finishedObject);
        console.log(obj);
        obj.top = "Copy of "+obj.top;
        // for(const key in obj) {
        //     if(typeof obj[key] == "object") {
        //         obj[key].forEach((element, index)=>{
        //             if(!obj[key][index].startsWith("file::")) { // folder
        //                 obj[key][index] = "Copy of "+element;
        //             } else { // file
        //                 obj["data-file::Copy of "+element.substring(6, element.length)] = files[element.substring(6, element.length)];
        //                 obj[key][index] = obj[key][index].replace("file::", "file::Copy of ");
        //             }
        //         });
        //     } else {
        //         if(!obj[key].startsWith("file::")) { // folder
        //             obj[key] = "Copy of "+obj[key];
        //         } else { // file
        //             obj["data-file::Copy of "+key.substring(6, key.length)] = files[key.substring(6, key.length)];
        //             obj[key] = obj[key].replace("file::", "file::Copy of ");
        //         }
                
        //     }
        // }
        return obj;
    }
    
    recursiveGetChildren(children, finishedObject) {
        children.forEach((child)=>{
            // console.log(child);
            if(child.reference.isFile) { // file
                finishedObject[child.name] = {name: child.name, dataPath: child.path};
            }
            else if(folders[child.path].subfolders) { // folder
                let subfolders = folders[child.path].subfolders.map((val)=>{
                    return {"name": folders[val].name, "path": val, reference: folders[val]}
                });
                finishedObject[child.name] = subfolders;
                
                this.recursiveGetChildren(subfolders, finishedObject);
            }
        });
        return finishedObject;
    }
}


function createDesktopFolder(x, y, name, path, appendee=document.body, color="white") {
    let newFolderContainer = document.createElement("div");
    newFolderContainer.classList.add("absolute", "clickable", "icon-container", "desktop-folder", "folder");
    newFolderContainer.style.top = y+"em";
    newFolderContainer.style.left = x+"em";
    newFolderContainer.setAttribute("path", path);
    // newFolderContainer.id = name;
    appendee.appendChild(newFolderContainer);

    // img
    let newFolder = document.createElement("img");
    newFolder.src = "assets/folder.png";
    newFolder.classList.add("icon", "unselectable");
    newFolderContainer.appendChild(newFolder);

    // text
    let text = document.createElement("div");
    text.classList.add(color, "sans-serif");
    text.innerText = name;
    newFolderContainer.appendChild(text);

    newFolderContainer.ondblclick = (event)=>{
        var n = new FileViewer;
        n.openFolderWindow(newFolderContainer.getAttribute("path"));
        // n.addFolder();
    }
    newFolderContainer.onclick = (event)=>{
        selectElement(event, newFolderContainer);
    }
}

/**
 * Select an element.
 * @param {Click Event} event - Allows for shift key
 * @param {HTMLElement} element 
 */
function selectElement(event, element) {
    if(document.querySelectorAll(".icon-selected").length > 0) {
        // shift must be down
        if(event.shiftKey) {
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