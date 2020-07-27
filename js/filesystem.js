class FileSystem {
    static addFolderAtLocation(name, parentPath) {
        let path = parentPath+name+"/";

        let num = 2;
        let oldPath = path;
        let oldName = name;
        while(folders[path]) { // already exists
            console.warn("There is already a folder with path "+path);
            path = oldPath+" "+num;
            name = oldName+" "+num;
            num++;
        }
        // Set new folder as subfolder of parent
        folders[parentPath].subfolders.unshift(path);

        // Set up metadata
        let currentDate = Date.now();

        // update folders{}
        folders[path] = {
            "name": name,
            kind: "Folder",
    
            subfolders: [],
            parent: parentPath,
    
            meta: {
                size:0,

                "creation-date": currentDate,
                "modified-date": currentDate,
                "last-opened-date": "Never",

                locked: false,

                "system-comments": [],
                "user-comments": [],

                hasTags: false,
                tags: []
            }
        };
        // update system
        filesystem.setItem("folders", folders);
    }
    /**
     * 
     * @param {String} name - The name of the new folder.
     * @param {Blob} data - The data of the new file.
     * @param {String} kind - The kind of the data. E.g. "Image" or "App"
     * @param {String} parentPath - The path to the parent of the new file.
     * @param {JSON} options - The options to pass in.
     */
    static addFileAtLocation(name, data, kind, parentPath, options={}) {
        let path = parentPath+name+"/";
        let extension = name.match(/\.[^.]+$/)[0];
        let binary = true;
        let content = "";
        let num = 2;
        let oldPath = path;
        let oldName = name;
        while(folders[path]) { // already exists
            console.warn("There is already a file with path "+path);
            path = oldPath+" "+num;
            name = oldName+" "+num;
            num++;
        }

        if(typeof data == "string") { // text encoded file
            binary = false;
            content = data;
            // don't set binaries
        } else {
            // update files
            files[path] = data;
            // update storage
            filesystem.setItem(path, data);
            content = options;
        }

        // Set new folder as subfolder of parent
        folders[parentPath].subfolders.unshift(path);

        // Set up metadata
        let currentDate = Date.now();

        // update folders{}
        folders[path] = {
            isFile: true,
            "name":name,
            "kind":kind,
            extension:extension,

            parent: parentPath,
            isBinary: binary,
            "content": content,

            meta: {
                size:0,

                "creation-date": currentDate,
                "modified-date": currentDate,
                "last-opened-date": "Never",

                locked: false,
                
                "system-comments": [],
                "user-comments": [],

                hasTags: false,
                tags: []
            }
        };
        
        // update system
        filesystem.setItem("folders", folders);
    }

    static requestFileByGUI(kind) {
        return new Promise((resolve, reject)=>{
            let win = new Window(300, 300, "File Selection", 25,20, 5, 5);
            let window = win.getWindow();
            window.classList.add("unselectable");

            let container = document.createElement("div");
            container.style.height = "calc(100% - 1em)";
            container.style.display = "flex";
            container.style.flexDirection = "column";

            let filesContainer = document.createElement("div");
            filesContainer.style.overflowY = "auto";
            filesContainer.style.overflowX = "hidden";
            filesContainer.style.flex = "3";
            filesContainer.style.border = "2px solid black";
            filesContainer.style.minHeight = "calc(100% - 2.2em)";
            filesContainer.style.color = "black";
            container.appendChild(filesContainer);

            let footer = document.createElement("div");
            footer.style.flex = "1";

            // "Open"
            let opener = document.createElement("button");
            opener.classList.add("default-button");
            opener.innerText = "Open";
            opener.style.display = "inline-block";
            opener.style.float = "right";
            opener.style.minWidth = "20%";
            opener.onclick = ()=>{
                let selected = filesContainer.querySelector(".select-gui-selected");
                if(selected) {
                    let foldersRef = folders[selected.getAttribute("path")];
                    if(foldersRef.kind != "Folder") {
                        resolve(selected.getAttribute("path"));
                        win.forceClose(false);
                    } else {
                        // open the folder
                        openFolder(selected.getAttribute("path"));
                    }
                }
            }
            footer.appendChild(opener);

            // "Cancel"
            let canceler = document.createElement("button");
            canceler.innerText = "Cancel";
            canceler.style.display = "inline-block";
            canceler.style.float = "right";
            canceler.style.minWidth = "20%";
            canceler.onclick = ()=>{
                reject("No file selected.");
                win.forceClose(false);
            }
            footer.appendChild(canceler);

            // Path
            let pathText = document.createElement("div");
            pathText.style.display = "inline-block";
            pathText.style.maxWidth = "50%";
            pathText.style.overflow = "hidden";
            pathText.style.whiteSpace = "no-wrap";
            pathText.style.textOverflow = "ellipsis";
            pathText.style.float = "left";
            pathText.style.color = "black";
            pathText.style.padding = "0.2em 0.2em";
            footer.appendChild(pathText);

            container.appendChild(footer);

            window.appendChild(container);


            // LOCATION
            let location = "/Users/"+NAME+"/";
            let currentFolder = NAME+"/";
            openFolder(location);

            // FUNCTIONS ? Do not include here?
            function openFolder(path) {
                // set the current folder and path
                currentFolder = folders[path].name;
                location = path;

                // set path text
                // pathText.innerHTML = "";
                let locationText = document.createElement("span");
                locationText.style.cursor = "pointer";
                locationText.innerText = currentFolder+"/";
                locationText.setAttribute("path", location);
                locationText.onclick = ()=>{
                    while(pathText.lastChild != locationText) {
                        pathText.removeChild(pathText.lastChild);
                    }
                    pathText.removeChild(pathText.lastChild); // remove the current one so the new one looks right
                    openFolder(locationText.getAttribute("path"));
                }
                pathText.appendChild(locationText);

                // update file container to show files
                filesContainer.innerHTML = "";
                let subs = folders[path].subfolders;
                subs.forEach((folder, index)=>{
                    if(!kind || folders[folder].kind == "Folder" || folders[folder].kind == kind) {
                        let container = document.createElement("div");
                        container.setAttribute("path", folder);
                        container.classList.add("select-gui-subfolder-container");
                        if(index % 2 == 0) {
                            container.classList.add("select-gui-a");
                        } else {
                            container.classList.add("select-gui-b");
                        }
                        container.innerText = folders[folder].name;
                        container.innerHTML += "<div style='float: right'>"+folders[folder].kind+"</div>";

                        container.onclick = ()=>{
                            // Remove old selection
                            filesContainer.querySelector(".select-gui-selected").classList.remove("select-gui-selected");
                            // Select this element
                            container.classList.add("select-gui-selected");
                        
                        }
                        container.ondblclick = ()=>{
                            let path = container.getAttribute("path");
                            if(folders[path].kind == "Folder") { // cannot open a non-folder file
                                // open folder
                                openFolder(container.getAttribute("path"));
                            }
                        }

                        filesContainer.appendChild(container);
                    }
                });
                if(filesContainer.firstChild) {
                    // select the first folder
                    filesContainer.firstChild.classList.add("select-gui-selected");
                } else {
                    filesContainer.innerText = "No items in folder";
                }
                
            }
        });
    }

    // ! DEBUG DO NOT INCLUDE BELOW IN PRODUCTION
    static clearAll() {
        localStorage.clear();
        filesystem.clear();
    }
}
setTimeout(()=>{ // allows browser to fully run the globalStyle.js script. Without this very strange bugs occur
    GlobalStyle.newClass("select-gui-a", "background-color: rgb(230,230,230);");
    GlobalStyle.newClass("select-gui-b", "background-color: rgb(250,250,250);");

    GlobalStyle.newClass("select-gui-subfolder-container", "max-height: 1.3em;", "height: 1.3em;", "font-size: 0.9em;", "color: black;", "cursor: pointer;", "padding: 0.2em 0.1em;", "margin: 0.2em 0;");
    GlobalStyle.newClass("select-gui-selected", "background-color: rgba(0, 89, 221, 1);", "color: white;");
}, 10);