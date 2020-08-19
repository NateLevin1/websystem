class FileSystemGUI {
    /**
     * @returns {Promise} A promise which is resolved with the path if a file is selected and rejected if no file is selected
     */
    static requestDirectory() {
        return new Promise((resolve, reject)=>{
            let win = new Window(300, 300, "Folder Selection", 27,20, {x: 5, y: 5});
            let window = win.getWindow();
            let header = win.getHeader();
            window.classList.add("unselectable");


            // Back button
            let backButton = document.createElement("div");
            backButton.classList.add("file-back-container", "unselectable", "no-move");
            
            let backImg = document.createElement("img");
            backImg.classList.add("file-back");
            backImg.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTMuMDI1IDFsLTIuODQ3IDIuODI4IDYuMTc2IDYuMTc2aC0xNi4zNTR2My45OTJoMTYuMzU0bC02LjE3NiA2LjE3NiAyLjg0NyAyLjgyOCAxMC45NzUtMTF6Ii8+PC9zdmc+";
            backButton.appendChild(backImg);
            
            header.insertBefore(backButton, win.getHeaderText());

            backButton.onclick = ()=>{
                pathText.removeChild(pathText.lastChild); // go back, remove child
                pathText.removeChild(pathText.lastChild); // twice because openFolder() re-adds it
                openFolder(folders[location].parent);
            }

            

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

            // for viewer instance
            let background = document.createElement("div");
            background.style.overflowY = "auto"; // scrolling
            background.style.overflowX = "hidden"; // scrolling


            const oneSelected = ()=>{
                if(win.isClosed()) {
                    document.removeEventListener("mouseup", oneSelected);
                }
                // remove selection from any others
                let allSelected = filesContainer.querySelectorAll(".icon-selected");
                if(allSelected.length > 1) {
                    allSelected.forEach((element, index)=>{
                        if(index > 0) {
                            element.classList.remove("icon-selected");
                        }
                    });
                }
            }
            document.addEventListener("mouseup", oneSelected);
            background.addEventListener("contextmenu", ()=>{
                filesContainer.querySelectorAll(".icon-selected").forEach((node)=>{
                    node.classList.remove("icon-selected");
                });
            });
            
            // viewer instance
            let fileViewer = new FileViewer();
            fileViewer.background = background;
            fileViewer.contentContainer = filesContainer;
            fileViewer.disableRightClick = true;
            fileViewer.window = true; // show up as black among other things

            // mock window
            fileViewer.win = {
                clear: ()=>{background.innerHTML = ""},
                isClosed: win.isClosed
            };
            fileViewer.openFolder = (path)=>{
                openFolder(path);
            }


            let footer = document.createElement("div");
            footer.style.flex = "1";

            // "Choose"
            let chooser = document.createElement("button");
            chooser.classList.add("default-button");
            chooser.innerText = "Choose";
            chooser.style.display = "inline-block";
            chooser.style.float = "right";
            chooser.style.minWidth = "20%";
            chooser.onclick = ()=>{
                let selected = filesContainer.querySelector(".icon-selected");
                if(selected) {
                    let foldersRef = folders[selected.getAttribute("path")];
                    if(foldersRef.kind == "Folder") {
                        resolve(selected.getAttribute("path"));
                        win.close(true);
                    } else {
                        alert("Please choose a folder!");
                    }
                } else {
                    // no selected, choose current
                    resolve(location);
                    win.close(true);
                }
            }
            footer.appendChild(chooser);

            // "Cancel"
            let canceler = document.createElement("button");
            canceler.innerText = "Cancel";
            canceler.style.display = "inline-block";
            canceler.style.float = "right";
            canceler.style.minWidth = "20%";
            canceler.onclick = ()=>{
                reject("No file selected.");
                win.close(false);
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
            let location = "/Users/";
            let currentFolder = "Users";
            updatePathText();
            location = "/Users/"+NAME+"/";
            currentFolder = "/Users";
            openFolder(location);


            // FUNCTIONS ? Do not include here?
            function openFolder(path) {
                fileViewer.win.clear();
                fileViewer.addBoxSelection();
                // set the current folder and path
                currentFolder = folders[path].name;
                location = path;

                // set path text
                updatePathText();

                fileViewer.displayFolders(location);

                background.childNodes.forEach((node)=>{ // disable dragging & remove as drop zone on all
                    let img = node.querySelector("img");
                    if(img) { // exclude the selection box
                        node.draggable = false;
                        img.classList.remove("folder-img");
                    }
                });
            }

            function updatePathText() {
                // pathText.innerHTML = "";
                let locationText = document.createElement("span");
                locationText.style.cursor = "pointer";
                locationText.innerText = "/"+currentFolder;
                locationText.setAttribute("path", location);
                locationText.onclick = ()=>{
                    while(pathText.lastChild != locationText) {
                        pathText.removeChild(pathText.lastChild);
                    }
                    pathText.removeChild(pathText.lastChild); // remove the current one so the new one looks right
                    openFolder(locationText.getAttribute("path"));
                }
                pathText.appendChild(locationText);
            }
        });
    }
    /**
     * Request a file for the user to select. Starts at the user's home directory.
     * <br> 
     * @example
     * FileSystem.requestFileByGUI("Image").then((path)=>{
     *  console.log("Path to selected image is "+path);
     * }).catch(()=>{
     *  console.log("File selection cancelled!");
     * });
     * @param {String} [kind] - The kind of file to be requested. e.g. 'Music' or 'Image'
     * @returns {Promise} The promise returned is resolved when the file is selected, and rejected if the file selection is cancelled.
     */
    static requestFile(kind="") {
        return new Promise((resolve, reject)=>{
            let win = new Window(300, 300, "File Selection", 27,20, {x: 5, y: 5});
            let window = win.getWindow();
            let header = win.getHeader();
            window.classList.add("unselectable");


            // Back button
            let backButton = document.createElement("div");
            backButton.classList.add("file-back-container", "unselectable", "no-move");
            
            let backImg = document.createElement("img");
            backImg.classList.add("file-back");
            backImg.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTMuMDI1IDFsLTIuODQ3IDIuODI4IDYuMTc2IDYuMTc2aC0xNi4zNTR2My45OTJoMTYuMzU0bC02LjE3NiA2LjE3NiAyLjg0NyAyLjgyOCAxMC45NzUtMTF6Ii8+PC9zdmc+";
            backButton.appendChild(backImg);
            
            header.insertBefore(backButton, win.getHeaderText());

            backButton.onclick = ()=>{
                pathText.removeChild(pathText.lastChild); // go back, remove child
                pathText.removeChild(pathText.lastChild); // twice because openFolder() re-adds it
                openFolder(folders[location].parent);
            }

            

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

            // viewer instance
            let background = document.createElement("div");
            background.style.overflowY = "auto"; // scrolling
            background.style.overflowX = "hidden"; // scrolling


            const oneSelected = ()=>{
                if(win.isClosed()) {
                    document.removeEventListener("mouseup", oneSelected);
                }
                // remove selection from any others
                let allSelected = filesContainer.querySelectorAll(".icon-selected");
                if(allSelected.length > 1) {
                    allSelected.forEach((element, index)=>{
                        if(index > 0) {
                            element.classList.remove("icon-selected");
                        }
                    });
                }
            }
            document.addEventListener("mouseup", oneSelected);
            background.addEventListener("contextmenu", ()=>{
                filesContainer.querySelectorAll(".icon-selected").forEach((node)=>{
                    node.classList.remove("icon-selected");
                });
            });
            

            let fileViewer = new FileViewer();
            fileViewer.background = background;
            fileViewer.contentContainer = filesContainer;
            fileViewer.disableRightClick = true;
            fileViewer.window = true; // show up as black among other things
            // mock window
            fileViewer.win = {
                clear: ()=>{background.innerHTML = ""},
                isClosed: win.isClosed
            };
            fileViewer.openFolder = (path)=>{
                openFolder(path);
            }


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
                let selected = filesContainer.querySelector(".icon-selected");
                if(selected) {
                    let foldersRef = folders[selected.getAttribute("path")];
                    if(foldersRef.kind != "Folder" && (kind ? kind : foldersRef.kind) == foldersRef.kind) {
                        resolve(selected.getAttribute("path"));
                        win.close(true);
                    } else if(foldersRef.kind == "Folder") {
                        // open the folder
                        openFolder(selected.getAttribute("path"));
                    } else {
                        alert("Incompatible file type "+foldersRef.kind);
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
                win.close(false);
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
            let location = "/Users/";
            let currentFolder = "Users";
            updatePathText();
            location = "/Users/"+NAME+"/";
            currentFolder = "/Users";
            openFolder(location);


            // FUNCTIONS ? Do not include here?
            function openFolder(path) {
                fileViewer.win.clear();
                fileViewer.addBoxSelection();
                // set the current folder and path
                currentFolder = folders[path].name;
                location = path;

                // set path text
                updatePathText();

                fileViewer.displayFolders(location);

                background.childNodes.forEach((node)=>{ // disable dragging & remove as drop zone on all
                    let img = node.querySelector("img");
                    if(img) { // exclude the selection box
                        node.draggable = false;
                        img.classList.remove("folder-img");
                    }
                });
            }

            function updatePathText() {
                // pathText.innerHTML = "";
                let locationText = document.createElement("span");
                locationText.style.cursor = "pointer";
                locationText.innerText = "/"+currentFolder;
                locationText.setAttribute("path", location);
                locationText.onclick = ()=>{
                    while(pathText.lastChild != locationText) {
                        pathText.removeChild(pathText.lastChild);
                    }
                    pathText.removeChild(pathText.lastChild); // remove the current one so the new one looks right
                    openFolder(locationText.getAttribute("path"));
                }
                pathText.appendChild(locationText);
            }
        });
    }
}

GlobalStyle.newClass("select-gui-a", "background-color: rgb(230,230,230);");
GlobalStyle.newClass("select-gui-b", "background-color: rgb(250,250,250);");

GlobalStyle.newClass("select-gui-subfolder-container", "max-height: 1.3em;", "height: 1.3em;", "font-size: 0.9em;", "color: black;", "cursor: pointer;", "padding: 0.2em 0.1em;", "margin: 0.2em 0;");
GlobalStyle.newClass("select-gui-selected", "background-color: rgba(0, 89, 221, 1);", "color: white;");