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
        desktopDiv.classList.add("desktop");
        folders["/Users/"+NAME+"/Desktop/"].subfolders.forEach((el) =>{
            if(!folders[el].isFile) {
                this.createFolder(folders[el].name, el, desktopDiv, true);
            } else {
                this.createFile(folders[el].name, el, folders[el].kind, desktopDiv);
            }
            
        });
        mainContent.appendChild(desktopDiv);

        desktopDiv.onmousedown = (event)=>{
            this.deselect(event);
        }

        this.createTopBar();

        this.background = desktopDiv;

        // set current folder for both use cases
        super.setCurrentFolder("/Users/"+NAME+"/Desktop/");
        this.setCurrentFolder("/Users/"+NAME+"/Desktop/");

        this.generatedWindow = "DESKTOP";
        this.addRightClickMenu();

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
        desktopDiv.appendChild(background);
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
            this.openFolderWindow("/Users/"+NAME+"/");
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

        TopBar.addToMenu("Close Window", "file", ()=>{ this.win.forceClose(); });
        // END FILE

        // EDIT
        TopBar.addToTop("Edit", "edit");
        TopBar.addToMenu("Undo", "edit", ()=>{ console.log("Undo not implemented"); });
        TopBar.addToMenu("Redo", "edit", ()=>{ console.log("Redo not implemented"); });
        TopBar.addLineToMenu("edit");
        TopBar.addToMenu("Cut", "edit", ()=>{ console.log("Cut not implemented"); });
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
    }

    openFolder() {
        console.warn("Folder tried to be opened in same window as desktop.");
    }
}