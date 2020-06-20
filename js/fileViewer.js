class FileViewer {
    openFolderWindow(open, previous=undefined) {
        let win = new Window(100,100,open);
        this.window = win.getWindow();
        this.header = win.getHeader();
        this.win = win;
        this.folderList = [open];
        this.currentFile = open;

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
        this.displayFolders(open);
        
        // Right click menu
        this.window.oncontextmenu = (e)=>{
            this.rightClick(e);
        }
    }
    openFolder(open, previous=undefined) {
        this.currentFile = open;
        this.win.clear();
        if(previous || this.previous) {
            let old = previous ? previous : this.previous;
            this.win.setTitle(old.join(" -> ")+" -> "+open);
            this.previous = [...old, open];
        } else {
            this.win.setTitle(open);
            
        }
        
        this.displayFolders(open);

        // Right click menu
        this.window.oncontextmenu = (e)=>{
            this.rightClick(e);
        }
    }
    displayFolders(open) {
        var positions = [1,2];
        if(files[open]) { // has something
            files[open].forEach(element =>{
                if(element.startsWith("file::")) { // is file
                    if(element.endsWith(".png")||element.endsWith(".jpg")||element.endsWith(".jpeg")) {
                        this.createFile(...positions,element.substring(6, element.length),this.window, "black", false, "image");
                    } else if(element.endsWith("app")) {
                        this.createFile(...positions,element.substring(6, element.length-4),this.window, "black", false, "app");
                    } else {
                        console.log(element);
                    }
                    
                } else { // is folder
                    this.createFolder(...positions,element,this.window, "black", false);
                }
                positions[0] += 8;
                // TODO Add y value increase
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
        } else {
            newFile.src = "assets/unknown.png";
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
            } else {
                alert("Opened File "+newFileContainer.id+"!");
            }
            
        };
    }
    getWindow() {
        return this.window;
    }

    goBackParent() {
        this.previous.pop();
        this.previous.pop();
        this.openFolder(files["parent-"+this.currentFile]);
    }
    rightClick(event) {
        /*event.preventDefault();
        console.log("Right click!");
        let contextMenu = document.createElement("div");
        contextMenu.classList.add("context-menu", "absolute", "invisible");
        contextMenu.style.top = event.clientY+"px";
        contextMenu.style.left = event.clientX+"px";

        document.body.appendChild(contextMenu);
        contextMenu.classList.remove("invisible");
        //contextMenu.classList.add("visible");*/
        // TODO Do this
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