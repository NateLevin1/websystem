class FileViewer {
    openFolderWindow(open, previous=undefined) {
        let win = new Window(100,100,open);
        this.window = win.getWindow();
        this.header = win.getHeader();
        this.win = win;

        if(!previous) {
            this.win.setTitle(open);
        } else {
            this.win.setTitle(previous.join(" -> ")+" -> "+open);
            this.previous = [...previous,open];
        }
        var positions = [1,2];
        if(files[open]) { // has something
            files[open].forEach(element =>{
                this.createFolder(...positions,element,this.window, "black", false);
                positions[0] += 8;
            });
        }
        
    }
    openFolder(open, previous=undefined) {
        this.win.clear();
        if(previous || this.previous) {
            let old = previous ? previous : this.previous;
            this.win.setTitle(old.join(" -> ")+" -> "+open);
            this.previous = [...old, open];
        } else {
            this.win.setTitle(open);
            
        }

        var positions = [1,2];
        if(files[open]) { // has something
            files[open].forEach(element =>{
                if(element.startsWith("file::")) { // is file
                    this.createFile(...positions,element.substring(6, element.length),this.window, "black", false);
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
            alert("Opened File "+newFileContainer.id+"!");
        };
    }
    getWindow() {
        return this.window;
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