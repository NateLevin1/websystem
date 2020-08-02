/**
 * The interface for adding and removing files in WebSystem.
 */
class FileSystem {
    /**
     * Add a new folder as a subfolder of <code>parentPath</code>
     * @param {String} name - The name of the folder to be added.
     * @param {String} parentPath - The path to the parent of the folder to be added. *Must* end in a slash ('/').
     * @returns {Promise} Returns the localForage setItem promise. Resolves once item has been added to localForage.
     */
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
        return filesystem.setItem("folders", folders);
    }
    /**
     * Add a file with the parent <code>parentPath</code>.
     * @param {String} name - The name of the new folder.
     * @param {(Blob|String)} data - The data of the new file. If string, the file will not be stored as binary.
     * @param {String} kind - The kind of the data. E.g. "Image" or "App"
     * @param {String} parentPath - The path to the parent of the new file.
     * @param {JSON} options - The options to pass in.
     * @param {String} options.alias - A name to be set instead of the given name. May cause issues.
     * @returns {Promise[]} [0] == folder promise. [1] == file promise (if any). Returns the localForage setItem promises. Resolves once item has been added to localForage.
     */
    static addFileAtLocation(name, data, kind, parentPath, options={}) {
        let path = parentPath+name+"/";
        let extension = name.match(/\.[^.]+$/)[0];
        let binary = true;
        let content = "";
        let num = 2;
        let oldPath = path;
        let oldName = name;
        let resultArray = [];
        while(folders[path]) { // already exists
            path = oldPath.substring(0,oldPath.length-1)/*<- Remove ending '/'*/+" "+num+"/";
            name = oldName+" "+num;
            console.warn("There is already a file with path. Changed to "+path+". New name is "+name);
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
            resultArray[1] = filesystem.setItem(path, data);
            content = options;
        }

        if(options.alias) {
            name = alias;
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
        resultArray[0] = filesystem.setItem("folders", folders);
        return resultArray;
    }
    static deleteFolderAtLocation(path) {
        let shouldDelete = FileSystem.recurseThroughSubfolders(path);
        shouldDelete.forEach((path)=>{
            FileSystem.deleteAnyAtLocation(path);
        });
    }
    static deleteAnyAtLocation(path) {
        if(folders[path].isFile) {// is file, delete from folders{} and files{}
            if(folders[path].isBinary) {
                delete files[path];
                filesystem.removeItem(path).catch((e)=>{
                    console.error("Error deleting file "+path, e);
                });
            }

            delete folders[path];
            filesystem.setItem("folders", folders);
        } else { // is folder, delete normally
            delete folders[path];
            filesystem.setItem("folders", folders);
        }
    }
    static recurseThroughSubfolders(path) {
        let subs = [path];
        if(!folders[path].isFile) {
            folders[path].subfolders.forEach((element)=>{
                subs.push(...FileSystem.recurseThroughSubfolders(element));
            });
        }
        return subs;
    }
    static moveFile(oldPath, newParentPath) {
        let name = folders[oldPath].name;
        let kind = folders[oldPath].kind;
        let path = newParentPath+name+"/";
        let oldName = name;
        while(folders[path]) { // already exists
            name = oldName+" "+num;
            path = newParentPath+name+"/";
            console.warn("There is already a file with path. Changed to "+path+". New name is "+name);
            num++;
        }
        if(folders[oldPath].isFile) { // is file
            // remove as subfile
            FileSystem.removeAsSubfolder(folders[oldPath].parent, oldPath);
            // add as an actual file
            if(folders[oldPath].isBinary) {
                FileSystem.addFileAtLocation(name, files[oldPath], kind, newParentPath)[1].catch((err)=>{
                    console.error("There was an error adding the file to the new location. Error: "+err);
                });
                delete files[oldPath];
                filesystem.removeItem(oldPath).catch((e)=>{
                        console.error("Error deleting file "+path, e);
                    });
            } else {
                FileSystem.addFileAtLocation(name, folders[oldPath].content, kind, newParentPath);
            }
            // delete old file in folders{}
            delete folders[oldPath];
            // set filesystem to correct value
            filesystem.setItem("folders", folders);
        } else { // is not file
            FileSystem.addFolderAtLocation(name, newParentPath);
            // remove oldPath as a subfolder of its parent
            FileSystem.removeAsSubfolder(folders[oldPath].parent, oldPath);
            FileSystem.moveWithSubfolders(oldPath, newParentPath+name+"/");
            // only setItem after everything is done
            filesystem.setItem("folders", folders);
        }
    }
    static moveWithSubfolders(recreationPath, newParent) {
        let subs = folders[recreationPath].subfolders;
        if(subs) {
            subs.forEach((element)=>{
                let fRef = folders[element];
                if(fRef.isFile) {
                    if(fRef.isBinary) {
                        FileSystem.addFileAtLocation(fRef.name, files[element], fRef.kind, newParent);
                        delete files[element];
                        delete folders[element];
                        filesystem.removeItem(element).catch((e)=>{
                                console.error("Error deleting file "+element, e);
                            });
                    } else {
                        FileSystem.addFileAtLocation(fRef.name, fRef.content, fRef.kind, newParent);
                        delete folders[element];
                    }
                } else {
                    FileSystem.addFolderAtLocation(fRef.name, newParent);
                    FileSystem.moveWithSubfolders(element, newParent+fRef.name+"/");
                }
            });
        }
        delete folders[recreationPath];
    }

    static removeAsSubfolder(parentPath, removePath, replacement=undefined) {
        let oldParentSubs = folders[parentPath].subfolders;
        if(replacement) {
            folders[parentPath].subfolders.splice(oldParentSubs.indexOf(removePath), 1, replacement);
        } else {
            folders[parentPath].subfolders.splice(oldParentSubs.indexOf(removePath), 1);
        }
    }

    static renameAny(oldPath, newPath, newName) {
        let fRef = folders[oldPath];
        if(fRef.isFile) { // changing a file does not require recursion so it is separated
            FileSystem.renameFile(oldPath, newPath, newName, fRef.parent);
        } else {
            FileSystem.removeAsSubfolder(fRef.parent, oldPath, newPath);
            FileSystem.recursiveRenameFolder(oldPath, newPath, fRef.parent);
            folders[newPath].name = newName;
        }
        filesystem.setItem("folders", folders);
    }
    /**
     * Rename a folder and its subfolders. Use renameAny() instead of this because this function won't update the filesystem.
     * @param {String} oldPath - The path to the folder before it is renamed
     * @param {String} newPath - The path the folder should be at after the folder is renamed
     */
    static recursiveRenameFolder(oldPath, newPath, newParent) {
        folders[newPath] = folders[oldPath];
        folders[newPath].parent = newParent;
        folders[newPath].subfolders.forEach((path, index)=>{
            let fRef = folders[path];
            if(fRef.isFile) {
                FileSystem.renameFile(path, newPath+fRef.name+"/", fRef.name, newPath);
            } else {
                FileSystem.recursiveRenameFolder(path, newPath+fRef.name+"/", newPath);
            }
            folders[newPath].subfolders[index] = newPath+fRef.name+"/";
        });
        delete folders[oldPath];
    }

    static renameFile(oldPath, newPath, newName, newParent) {
        FileSystem.removeAsSubfolder(folders[oldPath].parent, oldPath, newPath);
        let fRef = folders[oldPath];
        folders[newPath] = folders[oldPath];
        folders[newPath].name = newName;
        folders[newPath].parent = newParent;
        delete folders[oldPath];
        if(fRef.isBinary) {
            files[newPath] = files[oldPath]; // set new item as a copy of old one
            filesystem.setItem(newPath, files[oldPath]).then(()=>{ // add new item
                filesystem.removeItem(oldPath).catch((e)=>{ // remove old item
                    console.error("Error deleting file "+oldPath, e);
                });
            }); 
            delete files[oldPath]; // remove old item
        }
    }
    /**
     * Request a file for the user to select. Starts at the user's home directory.
     * <br> 
     * @example
     * FileSystem.requestFileByGUI("Image").then((path)=>{
     *  console.log("Path to selected file is "+path);
     * }).catch(()=>{
     *  console.log("File selection cancelled!");
     * });
     * @experimental The current GUI is not final. However, the return values will stay the same. Additionally, this code may be moved to its own class.
     * @param {String} kind - The kind of file to be requested. e.g. 'Music' or 'Image'
     * @returns {Promise} The promise returned is resolved when the file is selected, and rejected if the file selection is cancelled.
     */
    static requestFileByGUI(kind) {
        return new Promise((resolve, reject)=>{
            let win = new Window(300, 300, "File Selection", 25,20, {x: 5, y: 5});
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

// The path to the trash. May become an array later.
var trashPath = "";