function getChildren(name) {
    let children = folders[name];
    let finishedObject = { top: name };
    finishedObject["subs"] = children;
    let obj = recursiveGetChildren(children, finishedObject);
    for(const key in obj) {
        if(typeof obj[key] == "object") {
            obj[key].forEach((element, index)=>{
                obj[key][index] = "Copy of "+obj[key][index];
            });
        } else {
            obj[key] = "Copy of "+obj[key];
        }
    }
    return obj;
}
// ["file-list", "Top level file name", [["child1", [children of child 1]], ["child2"]]]
// makeFolder(topLevel)
// makeSubFolders(topLevel, [sub1, sub2])
// makeSubFolders(sub1, [sub1Sub]);

// * This function is my annual use of recursion.
function recursiveGetChildren(children, finishedObject) {
    children.forEach((child)=>{
        if(folders[child]) {
            finishedObject[child] = folders[child];
            recursiveGetChildren(folders[child], finishedObject);
        }
    });
    return finishedObject;
}
class FileViewer {
    openFolderWindow(open, previous=undefined) {
        let win = new Window(100, 100, open);
        this.window = win.getWindow();
        this.header = win.getHeader();
        this.win = win;
        this.folderList = [open];
        this.currentFolder = open;

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

        // Previous list
        if(!previous) {
            this.win.setTitle(open);
        } else {
            this.win.setTitle(previous.join(" -> ")+" -> "+open);
            this.previous = [...previous,open];
        }

        // background (for right click menu) cannot be inside display folders function or will be needlessly created and overwritten
        this.background = document.createElement("div");
        this.background.style.width = "100%";
        this.background.style.height = "calc(100% - 1em)";

        // Folder Display
        // ! Add custom scrollbar
        this.displayFolders(open);
        var oldWindowWidth = this.win.getWidthInEm();
        this.window.addEventListener('window-resize', ()=>{
            if(this.win.getWidthInEm() > oldWindowWidth+7||this.win.getWidthInEm() < oldWindowWidth-7) {
                this.realignFolders(); // update folder display. Could be faster by just updating positions
                oldWindowWidth = this.win.getWidthInEm();
            }
        });

        
        
        this.generatedWindow = this.win.makeString();

        // right click menu
        this.rightClickMenu = rightClickMenu;

        // icon right click
        RightClickMenu.addToMenu("Open", this.generatedWindow+"-folder", ()=>{ // required?
            var selected = document.querySelectorAll(".icon-selected");
            let names = [];
            selected.forEach((element)=>{
                names.push(element.querySelector("div").innerHTML);
            });
            this.intelligentOpen(names);
        });
        
        RightClickMenu.addToMenu("Open in New Window", this.generatedWindow+"-folder", ()=>{
            var selected = document.querySelector(".icon-selected");
            let n = new FileViewer;
            n.openFolderWindow(selected.querySelector("div").innerHTML);
        });

        RightClickMenu.addLineToMenu(this.generatedWindow+"-folder"); // breaking line

        RightClickMenu.addToMenu("Move To Trash", this.generatedWindow+"-folder", ()=>{
            console.log("Trash unavailable. 😬");
        });

        RightClickMenu.addLineToMenu(this.generatedWindow+"-folder"); // breaking line

        RightClickMenu.addToMenu("Copy", this.generatedWindow+"-folder", ()=>{
            let selected = document.querySelectorAll(".icon-selected");
            let copy = [];
            selected.forEach((element)=>{
                // let selectArr = [];
                let filename = element.querySelector("div").innerHTML;//+" copy";
                if(element.querySelector("img").src.includes("folder")) {
                    // file is a folder
                    // selectArr = [filename];
                    copy.push(getChildren(filename));
                } else {
                    // file is a file
                    // selectArr = filename, files[filename]; // files[filename] is the data
                }
                // copy.push(selectArr);
            });
            // console.log(["file-list", copy]);
            Clipboard.contents = ["file-list", copy];
        });
        
        RightClickMenu.addToMenu("Paste", this.generatedWindow+"-folder", ()=>{
            let contents = Clipboard.contents;
            
            if(contents[0] == "file-list") {
                contents.shift();
                contents = contents[0];
                console.log(contents);
                contents.forEach((element)=>{
                    // "element" is an object in the form:
                    //  { top: "topmost", subs:["sub1"], sub1: "sub2"}

                    this._addFolderToStorage(element["top"]);
                    let subs = element["subs"];
                    this.recursiveAddFromObject(subs, element["top"], element);
                    // subs.forEach((sub)=>{
                    //     this._addFolderToDifferentLocation(sub, element["top"]);
                    // });
                    
                //     if(element.length == 1) { // folder, [filename]
                //         this._addFolderToStorage(element[0]);
                //     } else if(element.length == 2) { // file, [filename, data]
                //         this._addFileToStorage(element[0], element[1]);
                //     }
                });
            }

            // this._addFolderToStorage(name);
            // this._addFileToStorage(filename, filedata);
        });

        RightClickMenu.addLineToMenu(this.generatedWindow+"-folder"); // breaking line

        RightClickMenu.addRightClickForClass(".folder", this.generatedWindow+"-folder", this.window);


        RightClickMenu.addToMenu("Add Folder", [this.generatedWindow, this.generatedWindow+"-icon", this.generatedWindow+"-folder"], ()=>{ this.makeNewFolder() });
        RightClickMenu.addToMenu("Upload Files", [this.generatedWindow, this.generatedWindow+"-icon", this.generatedWindow+"-folder"], ()=>{ this.uploadNewFile() });
        RightClickMenu.addRightClickForWindow(this.background, this.generatedWindow);
    }
    recursiveAddFromObject(children, parent, object) {
        children.forEach((child)=>{
            let searcher = child.substring(8, child.length);
            if(object[searcher]) { // if sub folders exist
                this._addFolderToDifferentLocation(child, parent);
                // console.log("Adding folder to different location. New name is "+child+". Parent of it is "+parent+".");
                this.recursiveAddFromObject(object[searcher], child, object);
            }
        });
        //return object;
    }
    openFolder(open, previous=undefined) {
        this.folderReferenceList = [];
        this.currentFolder = open;
        this.win.clear();
        if(previous || this.previous) {
            let old = previous ? previous : this.previous;
            this.win.setTitle(old.join(" -> ")+" -> "+open);
            this.previous = [...old, open];
        } else {
            this.win.setTitle(open);
        }

        this.displayFolders(open);

        // update right click menu
        // ! I have no idea why this works or how this works. However, only this works. Not commented out bit below, only this.
        RightClickMenu.addRightClickForClass(".folder", this.generatedWindow+"-folder", this.window);
        //RightClickMenu.addRightClickForClass(".icon-container", this.generatedWindow+"-icon", this.window);
    }
    realignFolders() {
        var list = this.folderReferenceList;
        var windowWidth = this.win.getWidthInEm();
        var positions = [1,2];
        list.forEach((element)=>{
            element.style.left = positions[0]+"em";
            element.style.top = positions[1]+"em";

            positions[0] += 8;
            if(positions[0] > windowWidth-7) {
                positions[1] += 8;
                positions[0] = 1;
            }
        });
    }
    displayFolders(open) {
        // background (for right click menu)
        this.window.appendChild(this.background);
        // Deselection
        this.background.onclick = ()=>{
            if(event.target == this.background) {
                clearSelected();
            }
        }


        this.folderReferenceList = [];
        var windowWidth = this.win.getWidthInEm();
        var positions = [1,2];
        if(folders[open]) { // has something
            folders[open].forEach(element =>{
                if(element.startsWith("file::")) { // is file
                    if(element.endsWith(".png")||element.endsWith(".jpg")||element.endsWith(".jpeg")) {
                        this.folderReferenceList.push(this.createFile(...positions,element.substring(6, element.length),this.window, "black", false, "image"));
                    } else if(element.endsWith("app")) {
                        this.folderReferenceList.push(this.createFile(...positions,element.substring(6, element.length-4),this.window, "black", false, "app"));
                    } else {
                        console.error("Error: Could not find file extension of file:");
                        console.log(element);
                    }
                } else { // is folder
                    this.folderReferenceList.push(this.createFolder(...positions,element,this.window, "black", false));
                }
                positions[0] += 8;
                if(positions[0] > windowWidth-7) {
                    positions[1] += 8;
                    positions[0] = 1;
                }
            });
        }
    }
    createFolder(x, y, name, appendee=document.body, color="white", newWindow=true) {
        let newFolderContainer = document.createElement("div");
        newFolderContainer.classList.add("absolute", "clickable", "icon-container", "folder"); // ? class desktop-folder
        newFolderContainer.style.top = y+"em";
        newFolderContainer.style.left = x+"em";
        newFolderContainer.id = name;
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
            if(newWindow == true) {
                var n = new FileViewer;
                n.openFolderWindow(newFolderContainer.id);
            } else {
                this.openFolder(newFolderContainer.id);
            }
        }

        // select
        newFolderContainer.onclick = function(event) {
            selectElement(event, newFolderContainer);
        }

        newFolderContainer.oncontextmenu = (event)=>{
            selectElement(event, newFolderContainer);
        }
        return newFolderContainer; // allows for adding to this.folderReferenceList
    }
    createFile(x, y, name, appendee=document.body, color="white", newWindow=true, filetype="image") {
        let newFileContainer = document.createElement("div");
        newFileContainer.classList.add("absolute", "clickable", "icon-container");
        newFileContainer.style.top = y+"em";
        newFileContainer.style.left = x+"em";
        newFileContainer.id = name;
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
                new ImageViewer(name);
            } else {
                alert("Opened File "+newFileContainer.id+"!");
            }
            
        }

        newFileContainer.onclick = function(event) {
            selectElement(event, newFileContainer);
        }
        newFileContainer.oncontextmenu = (event)=>{
            selectElement(event, newFileContainer);
        }

        return newFileContainer; // allows for adding to this.folderReferenceList
    }

    /**
     * Open the file wih specified name
     * @param {string, array} name 
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
                alert("Opened File "+newFileContainer.id+"!");
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
        this.previous.pop();
        this.previous.pop();
        this.openFolder(folders["parent-"+this.currentFolder]);
    }

    // FOLDER/FILE CREATION
    makeNewFolder() {
        try { // safety
            let blankFolder = this.createFolder(10,10,"untitled folder",this.window, "black", "false");
            this.folderReferenceList.unshift(blankFolder);
            blankFolder.classList.add("icon-selected", "icon-rename");

            let invisibleInput = document.createElement("input");
            invisibleInput.style.opacity = "0";
            invisibleInput.style.width = "0";
            invisibleInput.style.height = "0";
            document.body.appendChild(invisibleInput);
            
            let blankFolderText = blankFolder.querySelector("div");
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
                if(text.includes(",")||text.startsWith("file::")||Object.keys(folders).includes(text)) {
                    if(Object.keys(folders).includes(text)) {
                        let i = 2;
                        while(Object.keys(folders).includes(blankFolderText.innerText)) {
                            blankFolderText.innerText = text+" "+i;
                            i++;
                        }
                    } else {
                        blankFolderText.innerText = text.replace(/(?:,|file::)/g, "");
                    }
                }
                invisibleInput.remove();
                blankFolder.classList.remove("icon-rename");
                
                this._addFolderToStorage(blankFolderText.innerText);
                
            }
        this.realignFolders();
        } catch(e) {
            console.error("There was an issue in processing the folder creation. Error:");
            throw e;
        }
    }

    _addFolderToStorage(name) {
        let num = 2;
        while(folders[name]) { // already exists
            console.warn("There is already a folder with the name "+name+". Setting to "+name+" 2.");
            name += " "+num;
            num++;
        }
        // First, add a new empty folder to the end.
        let currentFolders = localStorage.getItem('folders');
        localStorage.setItem('folders', currentFolders+" ["+name+"]{}");
        // Next, add a new subfolder of the current directory.
        currentFolders = localStorage.getItem('folders');
        localStorage.setItem('folders', currentFolders.replace(this.currentFolder+"]{", this.currentFolder+"]{"+name+","));
        // Finally, add the properties to folders{} so they will display
        folders[name] = [];
        folders["parent-"+name] = this.currentFolder;
        folders[this.currentFolder].unshift(name); // ? push? It looks different after the page has been reloaded if push is used
        // And update the screen.
        this.previous.pop();
        this.openFolder(this.currentFolder);
    }

    _addFolderToDifferentLocation(name, newFolderName) {
        let num = 2;
        while(folders[name]) { // already exists
            console.warn("There is already a folder with the name "+name+". Setting to "+name+" 2.");
            name += " "+num;
            num++;
        }
        // First, add a new empty folder to the end.
        let currentFolders = localStorage.getItem('folders');
        localStorage.setItem('folders', currentFolders+" ["+name+"]{}");
        // Next, add a new subfolder of the current directory.
        currentFolders = localStorage.getItem('folders');
        localStorage.setItem('folders', currentFolders.replace(newFolderName+"]{", newFolderName+"]{"+name+","));
        // Finally, add the properties to folders{} so they will display
        folders[name] = [];
        folders["parent-"+name] = newFolderName;
        folders[newFolderName].unshift(name); // ? push? It looks different after the page has been reloaded if push is used
    }

    _addFileToStorage(filename, filedata) {
        // First, add the file as a sub file of the parent.
        let currentFolders = localStorage.getItem('folders');
        localStorage.setItem('folders', currentFolders.replace(this.currentFolder+"]{", this.currentFolder+"]{file::"+filename+","));
        // Next, add the data  of the file (not just the name as in previous step to localStorage (key 'files').
        var currentFiles = localStorage.getItem('files');
        var extension = filename.substring(filename.lastIndexOf("."), filename.length);
        if(extension == ".png") {
            localStorage.setItem('files', currentFiles+"["+filename+"]{"+filedata+"}");
            // add data to file
            files[filename] = filedata;
        }
        
        // Finally, add the file to folders{} so it will display
        folders[this.currentFolder].unshift("file::"+filename); // ? push? It looks different after the page has been reloaded if push is used
        // And update the screen.
        this.previous.pop();
        this.openFolder(this.currentFolder);
    }

    uploadNewFile() {
        let fileUpload = document.createElement("input");
        fileUpload.type = "file";
        fileUpload.click();
        var fileUploadEvent = function namelessName() {
            var file = fileUpload.files[0];

            // First, add the file as a sub file of the parent.
            let currentFolders = localStorage.getItem('folders');
            localStorage.setItem('folders', currentFolders.replace(this.currentFolder+"]{", this.currentFolder+"]{file::"+file.name+","));
            // Next, add the data  of the file (not just the name as in previous step to localStorage (key 'files').
            var currentFiles = localStorage.getItem('files');
            var extension = file.name.substring(file.name.lastIndexOf("."), file.name.length);
            if(extension == ".png") {
                Base64Image.fileToBase64(fileUpload, (filedata)=>{
                    localStorage.setItem('files', currentFiles+"["+file.name+"]{"+filedata+"}");
                    // add data to file
                    files[file.name] = filedata;
                });
            }
            
            // Finally, add the file to folders{} so it will display
            folders[this.currentFolder].unshift("file::"+file.name); // ? push? It looks different after the page has been reloaded if push is used
            // And update the screen.
            this.previous.pop();
            this.openFolder(this.currentFolder);
            fileUpload.removeEventListener('change', fileUploadEvent, false);
        }.bind(this);

        fileUpload.addEventListener('change', fileUploadEvent, false);
        
    }
}


function createDesktopFolder(x, y, name, appendee=document.body, color="white") {
    let newFolderContainer = document.createElement("div");
    newFolderContainer.classList.add("absolute", "clickable", "icon-container", "desktop-folder", "folder");
    newFolderContainer.style.top = y+"em";
    newFolderContainer.style.left = x+"em";
    newFolderContainer.id = name;
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
        n.openFolderWindow(newFolderContainer.id, ["usr"]);
        // n.addFolder();
    }
    newFolderContainer.onclick = (event)=>{
        selectElement(event, newFolderContainer);
    }
}

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