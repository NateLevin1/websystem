GlobalStyle.newClass("image-view-scroll", "display:flex;", "justify-content: center;", "align-items: center;", "overflow: auto;", "height: calc(100% - 1em);", "width: 100%;");
class ImageViewer {
    constructor(name, path) {
        if(!name && !path) { // open in standalone mode
            this.openInStandalone();
            return undefined; // prevent running of rest of code
        }
        var img = document.createElement("img");
        if(files[path]) {
            img.src = URL.createObjectURL(files[path]);
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

                win = new Window(size[0], size[1], name, size[2], size[3], 3, 3, false);
                win.setBackgroundColor("rgb(200, 200, 200)");


                this.window = win.getWindow();
                this.header = win.getHeader();
                this.win = win;
                let scrollContainer = document.createElement("div");
                scrollContainer.classList.add("image-view-scroll");
                scrollContainer.appendChild(img);
                this.window.appendChild(scrollContainer);

                this.addListeners();
            }.bind(this);
        }.bind(this);
    }

    addListeners() {
        this.window.classList.add("unselectable");
        this.window.addEventListener('window-resize', (event)=>{
            let windowWidth = this.win.getWidth();
            if(windowWidth < 30*em && this.img.style.maxWidth != "100%") {
                this.img.style.maxWidth = "100%";
            } else if(windowWidth > 30*em && this.img.style.maxWidth != "90%") {
                this.img.style.maxWidth = "90%";
            }
        });
    }

    openInStandalone() {
        this.win = new Window(280, 280, "Image Viewer", 25,25, 10, 5);
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

        this.window.appendChild(contentContainer);
    }
}

GlobalStyle.newClass("image-viewer-standalone-container", "height: calc(100% - 1em);", "display: flex;", "justify-content:center;", "align-items:center;");

appImagePaths["Image Viewer"] = "assets/image.png";
makeFunctions["Image Viewer"] = ()=>{ new ImageViewer };