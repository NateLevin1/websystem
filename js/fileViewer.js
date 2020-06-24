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
        this.window.classList.add("file-viewer-context-getter");
        RightClickMenu.addToMenu("Add Folder", this.generatedWindow, ()=>{this.makeNewFolder()});
        RightClickMenu.addToMenu("Upload Files", this.generatedWindow, ()=>{this.uploadNewFile()});
        RightClickMenu.addRightClickForWindow(this.window, this.generatedWindow);
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
        newFolderContainer.classList.add("absolute", "clickable", "icon-container"); // ? class desktop-folder
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
        let text = document.createElement("a");
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
        };

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
            
        }
        newFile.classList.add("icon", "unselectable");
        newFileContainer.appendChild(newFile);
    
        // text
        let text = document.createElement("a");
        text.classList.add(color, "sans-serif");
        text.innerText = name;
        newFileContainer.appendChild(text);
    
        newFileContainer.ondblclick = (event)=>{
            if(filetype == "app") {
                if(name == "Calculator") {
                    makeCalculator();
                }
            } else if(filetype == "image") {
                new ImageViewer(name);
            } else {
                alert("Opened File "+newFileContainer.id+"!");
            }
            
        };

        return newFileContainer; // allows for adding to this.folderReferenceList
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
            let name = prompt("Please enter a name for the folder.").toString(); // ! SHOW FAKE FOLDER, ADD NAME WITH INPUT ELEMENT
            while((name.includes(",")||name.startsWith("file::")||!name||Object.keys(folders).includes(name))) { // illegal names
                name = prompt("Error: Folder name cannot:\n1. Be the name of an existing folder\n2. Contain a comma\n3. Start with file::\n\nPlease enter a name for the folder.").toString();
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
        } catch(e) {
            console.error("There was an issue in processing the folder creation. Error:");
            throw e;
        }
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
                var data = Base64Image.fileToBase64(fileUpload, (filedata)=>{
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
    newFolderContainer.classList.add("absolute", "clickable", "icon-container", "desktop-folder");
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
    let text = document.createElement("a");
    text.classList.add(color, "sans-serif");
    text.innerText = name;
    newFolderContainer.appendChild(text);

    newFolderContainer.ondblclick = (event)=>{
        var n = new FileViewer;
        n.openFolderWindow(newFolderContainer.id, ["usr"]);
        // n.addFolder();
    };
    newFolderContainer.onclick = (event)=>{
        if(document.querySelectorAll(".icon-selected").length > 0) {
            // shift must be down
            if(event.shiftKey) {
                newFolderContainer.classList.add("icon-selected");
            } else {
                clearSelected();
                newFolderContainer.classList.add("icon-selected");
            }
        } else {
            // first to be selected
            newFolderContainer.classList.add("icon-selected");
        }
        
    }
}