GlobalStyle.newClass("image-view-scroll", "display:flex;", "justify-content: center;", "align-items: center;", "overflow: auto;", "height: calc(100% - 1em);", "width: 100%;");
/**
 * The image viewer interface for websystem. Opens in standalone mode if no name and path is provided, otherwise will open the actual image.
 */
class ImageViewer {
    /**
     * If name and path are not specified, opens a new window in standalone mode. Else, opens the image.
     * @param {String} name - The name of the image. Displayed as the header, does not necessarily need to be the actual name of the file
     * @param {String} path - The path of the file. Used to get the data to display.
     */
    constructor(name, path) {
        if(!name && !path) { // open in standalone mode
            this.standalone = true;
            this.openInStandalone();
            return undefined; // prevent running of rest of code
        }
        this.standalone = false;
        var img = document.createElement("img");
        if(files[path]) {
            img.src = URL.createObjectURL(files[path]);
            img.style.minHeight = "40px"
        } else {
            throw "No value for files[path]."
        }
        
        this.img = img;
        img.onload = function() {
            // only open when img has been loaded
            let sizeGetter = img.cloneNode();
            sizeGetter.style.display = "none";
            document.body.appendChild(sizeGetter);
            sizeGetter.onload = function () {
                var win;
                let size = [sizeGetter.naturalWidth+4, sizeGetter.naturalHeight+em+4, sizeGetter.naturalWidth/em+0.2, (sizeGetter.naturalHeight+em)/em+0.2];
                if(sizeGetter.naturalWidth > 30*em) {
                    size[0] = 15*em;
                    size[2] = 30;
                    img.style.maxWidth = "90%";
                }
                if(sizeGetter.naturalHeight > 30*em) {
                    size[1] = 15*em;
                    size[3] = 29;
                }
                document.body.removeChild(sizeGetter);
                this.zoomed = false;
                win = new Window(Math.max(size[0], 80), Math.max(size[1], 80+em/**Plus em because of top */), name, Math.max(size[2], 80/em), Math.max(size[3], (80/em)+1), {x: 3, y: 3, keepAspectRatio: false, topBarCreator: this.createTopBar, thisContext: this});
                win.setBackgroundColor("rgb(200, 200, 200)");


                this.window = win.getWindow();
                this.header = win.getHeader();
                this.win = win;
                let scrollContainer = document.createElement("div");
                scrollContainer.classList.add("image-view-scroll");
                scrollContainer.appendChild(img);
                this.window.appendChild(scrollContainer);
                this.scrollContainer = scrollContainer;

                this.addListeners();
            }.bind(this);
        }.bind(this);
    }

    addListeners() {
        this.window.classList.add("unselectable");
        this.window.addEventListener('window-resize', (event)=>{
            if(!this.zoomed) {
                let windowWidth = this.win.getWidth();
                if(windowWidth < 30*em && this.img.style.maxWidth != "100%") {
                    this.img.style.maxWidth = "100%";
                } else if(windowWidth > 30*em && this.img.style.maxWidth != "90%") {
                    this.img.style.maxWidth = "90%";
                }
            }
        });

        // keyboard shortcuts
        document.addEventListener("keydown", (event)=>{
            if(this.win.focused()) {
                if(event.metaKey || event.ctrlKey) {
                    if(event.key == "=" || event.key == "+") {
                        event.preventDefault();
                        this.zoomIn();
                    } else if(event.key == "-") {
                        event.preventDefault();
                        this.zoomOut();
                    }
                } else if(event.key == "ArrowUp" || event.key == "ArrowDown" || event.key == "ArrowLeft" || event.key == "ArrowRight") {
                    switch(event.key) {
                        case "ArrowUp":
                            this.scrollContainer.scrollTop -= 40;
                            break;
                        case "ArrowDown":
                            this.scrollContainer.scrollTop += 40;
                            break;
                        case "ArrowLeft":
                            this.scrollContainer.scrollLeft -= 40;
                            break;
                        case "ArrowRight":
                            this.scrollContainer.scrollLeft += 40;
                            break;
                    }
                }
            }
        });
    }

    openInStandalone() {
        this.win = new Window(280, 280, "Image Viewer", 25,25, {x: 10, y: 5, topBarCreator: this.createTopBar, thisContext: this});
        this.win.setBackgroundColor("rgb(230, 230, 230)");
        this.window = this.win.getWindow();
        this.header = this.win.getHeader();

        this.window.classList.add("unselectable");

        let contentContainer = document.createElement("div");
        contentContainer.classList.add("image-viewer-standalone-container");

        let fileOpen = document.createElement("button");
        fileOpen.innerText = "Choose a File";
        fileOpen.classList.add("unselectable");
        fileOpen.style.fontSize = "1em";
        fileOpen.style.cursor = "pointer";
        fileOpen.onclick = ()=>{
            FileSystem.requestFileByGUI("Image").then((selection)=>{
                new ImageViewer(folders[selection].name, selection);
                this.win.forceClose();
            }).catch((reason)=>{
                console.log(reason);
            });
        }
        contentContainer.appendChild(fileOpen);
        this.fileOpen = fileOpen;

        this.window.appendChild(contentContainer);
    }

    createTopBar() {
      TopBar.addToTop("File", "file");
      if(this.standalone) {
        TopBar.addToMenu("Choose Image", "file", ()=>{ 
            this.fileOpen.click();
        });
      } else {
        TopBar.addToMenu("Choose Image", "file", ()=>{ 
            new ImageViewer;
        });
      }

      TopBar.addToTop("View", "view");
      TopBar.addToMenuIf(()=>{ return !this.standalone; }, "Zoom In", "view", this.zoomIn.bind(this), {thisContext: this, clickable: true});
      TopBar.addToMenuIf(()=>{ return !this.standalone; }, "Zoom Out", "view", this.zoomOut.bind(this), {thisContext: this, clickable: true});
      
      if(!this.standalone) {
        let scrollSelect = TopBar.addToMenu("Scroll  ▶", "view", undefined, {clickable: false});
        TopBar.addSecondaryListenerForItem({el: scrollSelect, name:"scrollSelect"});
        TopBar.addToMenu("Up", "scrollSelect", ()=>{ 
              this.scrollContainer.scrollTop -= 60;
        });
        TopBar.addToMenu("Down", "scrollSelect", ()=>{ 
              this.scrollContainer.scrollTop += 60;
        });
        TopBar.addToMenu("Left", "scrollSelect", ()=>{ 
              this.scrollContainer.scrollLeft -= 60;
        });
        TopBar.addToMenu("Right", "scrollSelect", ()=>{ 
              this.scrollContainer.scrollLeft += 60;
        });
      }
      
      TopBar.addToMenu("Close Window", "file", ()=>{ this.win.forceClose(); });

      TopBar.addToTop("Help", "help");
      TopBar.addToMenu("About Image Viewer", "help", ()=>{ About.newWindow("Image Viewer", "The official Image Viewer for WebSystem.", "1.0", "assets/image.png"); });
    }

    zoomIn() {
        this.zoomed = true;
        this.img.style.maxWidth = "100em"; // practically infinite, allow scrolling
        this.img.style.maxHeight = "100em";
        this.img.style.height = (this.img.clientHeight + 9*em).toString() + "px";
        this.img.style.objectFit = "cover";
    }
    zoomOut() {
        this.zoomed = true;
        this.img.style.maxWidth = "120em"; // practically infinite, allow scrolling
        this.img.style.maxHeight = "120em";
        this.img.style.height = (this.img.clientHeight - 9*em).toString() + "px";
        if(this.img.clientHeight < 40) {
            this.img.style.height = "40px";
        }
        this.img.style.objectFit = "cover";
    }
}

GlobalStyle.newClass("image-viewer-standalone-container", "height: calc(100% - 1em);", "display: flex;", "justify-content:center;", "align-items:center;");

appImagePaths["Image Viewer"] = "assets/image.png";
makeFunctions["Image Viewer"] = ()=>{ new ImageViewer };