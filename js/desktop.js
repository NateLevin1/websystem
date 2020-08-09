/**
 * Remove the 'icon-selected' class from all icons. Note that this will not deselect any icons in a file chooser GUI.
 */
function clearSelected() {
    let selected = document.querySelectorAll(".icon-selected");
    selected.forEach((node)=>{
        node.classList.remove("icon-selected");
    });
}

class Desktop extends FileViewer {
    constructor() {
        super();
        let desktopDiv = document.createElement("div");
        this.background = desktopDiv;
        this.background.classList.add("background-drop");
        this.background.setAttribute("path", "/Users/"+NAME+"/Desktop/");
        this.generatedWindow = "DESKTOP";
        this.addRightClickMenu();
        
        desktopDiv.classList.add("desktop");
        this.addFromFolders();
        mainContent.appendChild(desktopDiv);
        this.desktopDiv = desktopDiv;

        desktopDiv.onmousedown = (event)=>{
            this.deselect(event);
        }

        this.createTopBar();
        this.addBoxSelection();

        // set current folder for both use cases
        super.setCurrentFolder("/Users/"+NAME+"/Desktop/");
        this.setCurrentFolder("/Users/"+NAME+"/Desktop/");

        

        document.addEventListener("window-focus", (event)=>{
            if(event.window != "DESKTOP") { // there is a window
                this.hasFocus = false;
            } else { // there are no windows, desktop should get focus
                this.focusDesktop();
            }
        });

        let background = document.createElement("img");
        background.classList.add("desktop-background", "unselectable");
        background.src = "assets/licensed/bg1.jpg";
        background.draggable = false;
        mainContent.appendChild(background);
    }

    focusDesktop() {
        // show top bar
        if(!this.hasFocus) {
            this.createTopBar();
        }
    }

    deselect(event) {
        if(event.target == this.background) {
            clearSelected();
            focusEvent.window = "DESKTOP";
            document.dispatchEvent(focusEvent);
        }
    }

    createTopBar() {
        this.hasFocus = true;
        TopBar.clear();

        // FILE
        TopBar.addToTop("File", "file");

        TopBar.addToMenu("New Window", "file", ()=>{
            let tmp = new FileViewer; // create new instance
            tmp.openFolderWindow("/Users/"+NAME+"/");
        });

        let newSelect = TopBar.addToMenu("New  ▶", "file", undefined, {clickable: false});
        TopBar.addSecondaryListenerForItem({el: newSelect, name:"newSelect"});
        TopBar.addToMenu("Folder", "newSelect", ()=>{ this.makeNewFolder() });
        TopBar.addToMenu("File", "newSelect", ()=>{ console.log("New File!"); });
        TopBar.addLineToMenu("file");
        TopBar.addToMenuIf(()=>{
            // returns true if anything is selected, false if not.
            let selected = this.background.querySelector(".icon-selected");
            return !!selected;
        }, "Open Selection", "file", this.openSelected.bind(this));

        TopBar.addToMenuIf(()=>{ return false; }, "Close Window", "file", undefined);
        // END FILE

        // EDIT
        TopBar.addToTop("Edit", "edit");
        TopBar.addToMenu("Undo", "edit", ()=>{ console.log("Undo not implemented"); });
        TopBar.addToMenu("Redo", "edit", ()=>{ console.log("Redo not implemented"); });
        TopBar.addLineToMenu("edit");
        TopBar.addToMenu("Cut", "edit", this.cutFiles.bind(this));
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

        this.desktopDiv.addEventListener("file-system-change", ()=>{
            this.reloadDesktop();
        });

        this.addDragListeners();
    }

    reloadDesktop() {
        this.desktopDiv.innerHTML = "";
        this.addFromFolders();
    }

    openFolder() {
        console.warn("Folder tried to be opened in same window as desktop.");
    }

    addFromFolders() {
        folders["/Users/"+NAME+"/Desktop/"].subfolders.forEach((el) =>{
            if(!folders[el].isFile) {
                this.createFolder(folders[el].name, el, this.desktopDiv, true);
            } else {
                this.createFile(folders[el].name, el, folders[el].kind, this.desktopDiv);
            }
        });
    }

    addDragListeners() {
        // This code runs for *all* dragging

        // modified from https://developer.mozilla.org/en-US/docs/Web/API/Document/drag_event
        var dragged;

        document.addEventListener("dragstart", function(event) {
            // store a ref. on the dragged elem
            dragged = event.target;
            dragged.querySelector("img").classList.remove("folder-img");
            // make it half transparent
            event.target.style.opacity = "0.6";

            // set the correct image (includes all selections)
            let selected = mainContent.querySelectorAll(".icon-selected");
            selected = Array.from(selected);



            if(selected && !(selected.length == 1 && selected[0] == dragged) && selected.includes(dragged)) { // add the multiple thing
                event.target.style.opacity = "1";
                let selDiv = document.createElement("div");
                selDiv.style.pointerEvents = "none";
                selDiv.style.paddingLeft = "4px";
                selDiv.style.paddingRight = "4px";
                selDiv.style.textAlign = "center";

                let multipleText = document.createElement("p");
                multipleText.textContent = "Multiple:";
                multipleText.classList.add("multiple-text");
                selDiv.appendChild(multipleText);
                selected.forEach((element)=>{
                    if(element.draggable) {
                        let el = element.cloneNode(true);
                        el.style.opacity = "1";
                        el.style.margin = "0";
                        el.style.minHeight = "2em";
                        el.querySelector("img").remove();
                        selDiv.appendChild(el);
                    } else {
                        // remove from selection
                        element.classList.remove("icon-selected");
                    }
                    
                });

                selDiv.style.display = "block";
                selDiv.style.position = "absolute";
                selDiv.style.top = "100px";
                selDiv.style.left = "100px";
                selDiv.style.zIndex = "20";
                selDiv.style.width = window.getComputedStyle(event.target).getPropertyValue("width");

                document.body.appendChild(selDiv);
                event.dataTransfer.setDragImage(selDiv, selDiv.style.width.substring(0, selDiv.style.width.length-2)/2-2, 2.5*em);


                setTimeout(()=>{
                    selDiv.remove();
                }, 1);
            } else if(!selected.includes(dragged)) {
                // remove old selection if it isn't included
                selected.forEach((element)=>{
                    element.classList.remove("icon-selected");
                });
            }
        }, false);

        document.addEventListener("dragend", function(event) {
            // reset the transparency
            event.target.style.opacity = "";
            dragged.querySelector("img").classList.add("folder-img");
        }, false);

        /* events fired on the drop targets */
        document.addEventListener("dragover", function(event) {
            // prevent default to allow drop
            event.preventDefault();
        }, false);

        document.addEventListener("dragenter", function(event) {
            if (event.target.className.includes("folder-img")) {
                event.target.parentNode.classList.add("folder-move-in");
            } else if(event.target.className.includes("background-drop") && event.target.getAttribute("path") != dragged.getAttribute("path") && folders[dragged.getAttribute("path")].parent != event.target.getAttribute("path")) {
                event.target.classList.add("background-drop-move-in");
            }
        }, false);

        document.addEventListener("dragleave", function(event) {
            if (event.target.className.includes("folder-img")) {
                event.target.parentNode.classList.remove("folder-move-in");
            }  else if(event.target.className.includes("background-drop") && event.target.getAttribute("path") != dragged.getAttribute("path") && folders[dragged.getAttribute("path")].parent != event.target.getAttribute("path")) {
                event.target.classList.remove("background-drop-move-in");
            }
        }, false);

        document.addEventListener("drop", function(event) {
            try {
                // prevent default action (open as link for some elements)
                event.preventDefault();
                let draggedPath = dragged.getAttribute("path");
                
                // move dragged elem to the selected drop target
                if (event.target.className.includes("folder-img")) {
                    // event.target == the element that the drag was ended on
                    event.target.parentNode.classList.remove("folder-move-in");
                    let eventTargetPath = event.target.parentNode.getAttribute("path");

                    // move file
                    let successful = FileSystem.moveFile(draggedPath, eventTargetPath);
                    if(successful) {
                        // fill trash
                        if(eventTargetPath == trashPath) {
                            event.target.src = "assets/trash.png";
                        }
                        // after moving file, remove from display
                        dragged.remove();
                    }

                    // also do all the selected ones
                    let selected = document.querySelectorAll(".icon-selected");
                    if(selected) {
                        selected.forEach((element)=>{
                            let elPath = element.getAttribute("path");
                            if(elPath != draggedPath) { // make sure not duplicate
                                let successful = FileSystem.moveFile(elPath, eventTargetPath);
                                if(successful) {
                                    // after moving file, remove from display
                                    element.remove();
                                }
                            }
                        });
                    }
                } else if(event.target.className.includes("background-drop") && event.target.getAttribute("path") != draggedPath && folders[draggedPath].parent != event.target.getAttribute("path")) {
                    // event.target == the element that the drag was ended on
                    event.target.classList.remove("background-drop-move-in");
                    let eventTargetPath = event.target.getAttribute("path");
                    // move file
                    let successful = FileSystem.moveFile(draggedPath, eventTargetPath);
                    if(successful) {
                        setTimeout(()=>{
                            event.target.dispatchEvent(fileSystemChange);
                        }, 20);
    
                        // fill trash
                        if(eventTargetPath == trashPath && document.getElementById("trash").src != "assets/trash.png") {
                            document.getElementById("trash").src = "assets/trash.png";
                        }
    
                        // after moving file, remove from display
                        dragged.remove();
                    }

                    // also do all the selected ones
                    let selected = document.querySelectorAll(".icon-selected");
                    if(selected) {
                        selected.forEach((element)=>{
                            let elPath = element.getAttribute("path");
                            if(elPath != draggedPath) { // make sure not duplicate
                                let successful = FileSystem.moveFile(elPath, eventTargetPath);
                                if(successful) {
                                    // after moving file, remove from display
                                    element.remove();
                                }
                            }
                        });
                    }
                }
            } catch(e) {
                console.error(e, "Dragged:",dragged, "draggedPath:"+dragged.getAttribute("path"), "Folders[draggedPath]", folders[dragged.getAttribute("path")]);
            }
        }, false);
        
    }
}

var fileSystemChange = new Event("file-system-change");