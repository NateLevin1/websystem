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
        this.addSystemUpdateListeners();

        // set current folder for both use cases
        super.setCurrentFolder("/Users/"+NAME+"/Desktop/");
        this.setCurrentFolder("/Users/"+NAME+"/Desktop/");

        super.win = {isClosed: ()=>{return false}}

        document.addEventListener("window-focus", (event)=>{
            if(event.window == "DESKTOP") { // there are no windows, desktop should get focus
                this.focusDesktop();
            }
        });

        const getCustomBG = (path)=>{
            if(objectURLS[path]) {
                return objectURLS[path];
            } else {
                let url = URL.createObjectURL(files[path]);
                objectURLS[path] = url;
                return url;
            }
        }

        let background = document.createElement("img");
        background.classList.add("desktop-background", "unselectable");
        let general = JSON.parse(folders["/etc/general.json/"].content);
        background.src = general["isBgCustom"] ? getCustomBG(general["bg"]) : general["bg"];
        background.draggable = false;
        document.body.appendChild(background);
        window.desktopBackground = background;
    }

    focusDesktop() {
        // show top bar
        this.createTopBar();
    }

    deselect(event) {
        if(event.target == this.background) {
            clearSelected();
            focusEvent.window = "DESKTOP";
            document.dispatchEvent(focusEvent);
        }
    }

    createTopBar() {
        TopBar.clear();

        TopBar.addName("Desktop");

        // FILE
        TopBar.addToTop("File", "file");

        TopBar.addToMenu("New Window", "file", ()=>{
            let tmp = new FileViewer; // create new instance
            tmp.openFolderWindow("/Users/"+NAME+"/");
        });

        let newSelect = TopBar.addToMenu("New  ▶", "file", undefined, {clickable: false});
        TopBar.addSecondaryListenerForItem({el: newSelect, name:"newSelect"});
        TopBar.addToMenu("Folder", "newSelect", ()=>{ this.makeNewFolder() });
        TopBar.addLineToMenu("file");
        fileNewPossibilities.forEach((obj)=>{
            TopBar.addToMenu(obj.name, "newSelect", ()=>{obj.callback(this.currentFolder)});
        });
        TopBar.addToMenuIf(()=>{
            // returns true if anything is selected, false if not.
            let selected = this.background.querySelector(".icon-selected");
            return !!selected;
        }, "Open Selection", "file", this.openSelected.bind(this));

        TopBar.addToMenuIf(()=>{ return false; }, "Close Window", "file", undefined);
        // END FILE

        // EDIT
        TopBar.addToTop("Edit", "edit");
        // TopBar.addToMenu("Undo", "edit", ()=>{ console.log("Undo not implemented"); });
        // TopBar.addToMenu("Redo", "edit", ()=>{ console.log("Redo not implemented"); });
        // TopBar.addLineToMenu("edit");
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
    }

    reloadDesktop() {
        this.desktopDiv.innerHTML = "";
        this.addFromFolders();
    }

    openFolder() {
        console.warn("Folder tried to be opened in same window as desktop.");
    }

    addFromFolders() {
        this.shownSubfolders = [];
        folders["/Users/"+NAME+"/Desktop/"].subfolders.forEach((el) =>{
            if(!folders[el].isFile) {
                this.createFolder(folders[el].name, el, true);
            } else {
                this.createFile(folders[el].name, el, folders[el].kind);
            }
        });
    }
}

function moveByDrop(target, draggedPath, dragged) {
    let eventTargetPath = target.getAttribute("path");

    let fls = []; // holds files that need to be done at some point after folders are done

    if(folders[draggedPath].kind == "Folder") { // do folders first
        // move file
        let successful = FileSystem.moveFile(draggedPath, eventTargetPath);
        if(successful) {
            setTimeout(()=>{
                target.dispatchEvent(fileSystemChange);
            }, 20);

            // after moving file, remove from display
            dragged.remove();
        }
    } else {
        // add to the fls list
        fls.push(dragged);
    }
    

    // do all the selected ones
    let selected = document.querySelectorAll(".icon-selected");
    if(selected) {
        selected.forEach((element)=>{
            let elPath = element.getAttribute("path");
            if(folders[elPath]/* <- If this is false then the file has probably already been deleted. This can happen if the parent of the file was deleted before this file was deleted. */) {
                if(folders[elPath].kind == "Folder") { // if folder, do it now
                    if(elPath != draggedPath /* <- don't duplicate */) {
                        let successful = FileSystem.moveFile(elPath, eventTargetPath);
                        if(successful) {
                            // after moving file, remove from display
                            element.remove();
                        }
                    }
                } else { // add to fls
                    fls.push(element);
                }
            } else {
                element.remove();
            }
        });
    }


    // once done moving all folders, move the files
    fls.forEach((element)=>{
        let elPath = element.getAttribute("path");
        if(folders[elPath]/* <- If this is false then the file has probably already been deleted. This can happen if the parent of the file was deleted before this file was deleted. */) {
            let successful = FileSystem.moveFile(elPath, eventTargetPath);
            if(successful) {
                // after moving file, remove from display
                element.remove();
            }
        } else {
            element.remove();
        }
    });
}

var fileSystemChange = new Event("file-system-change");