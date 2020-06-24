class ImageViewer {
    constructor(name) {
        var data = "data:image/png;base64,"+files[name];
        var converter = new Base64Image();

        var img = converter.fromBase64(data);
        this.img = img;
        img.onload = function() {
            // only open when img has been loaded
            let sizeGetter = img.cloneNode();
            sizeGetter.style.display = "none";
            document.body.appendChild(sizeGetter);
            sizeGetter.onload = function () {
                let win = new Window(sizeGetter.naturalWidth, sizeGetter.naturalHeight+em, name, sizeGetter.naturalWidth/em, (sizeGetter.naturalHeight+em)/em,3,3,true);
                document.body.removeChild(sizeGetter);

                this.window = win.getWindow();
                this.header = win.getHeader();
                this.win = win;
                this.window.appendChild(img);

                this.addListeners();
            }.bind(this);
        }.bind(this);

        
        
    }

    addListeners() {
        this.window.classList.add("unselectable");
        this.window.addEventListener('window-resize', (event)=>{
            let windowWidth = this.win.getWidth();
            this.img.style.width = windowWidth+"px";
        });
    }
}