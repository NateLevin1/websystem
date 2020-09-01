(function () {
/**
 * @ignore
 * The interface for changing system settings in WebSystem
 */
class SystemSettings {
    constructor() {
        let win = new Window(414, 251, "System Settings", 32, 30,{x: 4, y: 4, thisContext: this, pathToApp: "/Users/"+NAME+"/Applications/System Settings.app/", appName:"System Settings"});
        this.window = win.getWindow();
        this.window.classList.add("unselectable");
        this.header = win.getHeader();
        this.win = win;
        win.setBackgroundColor("rgb(230,230,230)");

        let contentContainer = document.createElement("div");
        contentContainer.style.height = "calc(100% - 1.2em)";
        contentContainer.classList.add("settings-container");
        this.window.appendChild(contentContainer);
        this.contentContainer = contentContainer;

        let sidebar = document.createElement("aside");
        sidebar.classList.add("settings-sidebar");
        contentContainer.appendChild(sidebar);
        this.sidebar = sidebar;

        let content = document.createElement("main");
        content.classList.add("settings-content");
        contentContainer.appendChild(content);
        this.content = content;

        // content functions
        const showGeneral = ()=>{
            this.clearContent();
            this.selectItem(0);
            this.addContentHeader("General");

            this.addSection("Highlight Color");
            this.addHighlight();
            this.addDescription("Sets the color that shows when something is highlighted.");

            this.addSection("Performance Mode");
            this.addSwitch(performanceModeEnabled, (onoff)=>{
                performanceModeEnabled = onoff;
                save("general", "performanceModeEnabled", performanceModeEnabled);
            });
            this.addDescription("Various features that are good for computers with poor performance or battery are enabled.");
        
            this.addSection("Desktop Background");
            let thumbArr = ["assets/licensed/thumbbg1.jpg","assets/licensed/thumbbg2.jpg", "assets/licensed/thumbbg3.jpg", "assets/licensed/thumbbg4.jpg", "assets/licensed/thumbbg5.jpg", "assets/licensed/thumbbg6.jpg", "upload"];
            this.addImageSelect(thumbArr, (selectionSrc, path)=>{
                let isCustom = !!path;
                desktopBackground.src = isCustom ? selectionSrc : selectionSrc.replace("thumb", "");
                save("general", "isBgCustom", isCustom);
                save("general", "bg", isCustom ? path : selectionSrc.replace("thumb", ""));
            });
            this.addDescription("Set the background that shows up on the desktop.");
        }

        const showAccount = ()=>{
            this.clearContent();
            this.selectItem(1);
            this.addContentHeader("Account");
            if(!isGuest) {
                this.addSection("Log Out of WebSystem");
                this.addButton("Log Out", ()=>{
                    alert("Logging you out. The window will reload...");
                    var auth2 = gapi.auth2.getAuthInstance();
                    auth2.signOut().then(()=>{
                        localStorage.setItem("name", "");
                        window.location.reload(false);
                    });
                });
                this.addDescription("Logs you out of the current account. Your data is still saved.");
            }
            this.addSection("Factory Reset");
            this.addButton("Reset", ()=>{
                confirm("Are you sure you want to factory reset? This will irreversibly delete all of the data stored on this machine.")
                .then((decision)=>{
                    if(decision) {
                        var auth2 = gapi.auth2.getAuthInstance();
                        auth2.signOut().then(()=>{
                            // they want to continue, delete it
                            localStorage.clear();
                            sessionStorage.clear();
                            filesystem.clear();

                            alert("Data deleted. Reloading in 5 seconds...");
                            setTimeout(()=>{
                                window.location.reload(false);
                            }, 5000);
                        });
                    }
                });
            });
            this.addDescription("Deletes all data currently stored on the computer.");
        };

        const showAudio = ()=>{
            this.clearContent();
            this.selectItem(2);
            this.addContentHeader("Audio");

            this.addSection("Volume");
            this.addSlider(0, 100, 1, volume, (value)=>{
                volume = parseFloat(value);
                label.textContent = volume.toString() + "%";
                document.querySelectorAll("audio").forEach((node)=>{
                    node.volume = volume/100;
                });
            });
            let label = this.addDescription(volume.toString() + "%");
        }


        // Sidebar Items
        this.addSidebarItem("General", showGeneral);
        this.addSidebarItem("Account", showAccount);
        this.addSidebarItem("Audio", showAudio);
        
        // start at general
        this.selectItem(0);
        showGeneral();
    }

    addSidebarItem(text, callback) {
        let el = document.createElement("a");
        el.onclick = callback;
        el.textContent = text;
        el.classList.add("settings-sidebar-item");
        this.sidebar.appendChild(el);
    }

    selectItem(itemIndex) {
        [...this.sidebar.querySelectorAll(".settings-sidebar-item-selected")].forEach((node)=>{
            node.classList.remove("settings-sidebar-item-selected");
        });
        this.sidebar.childNodes[itemIndex].classList.add("settings-sidebar-item-selected");
    }

    clearContent() {
        this.content.innerHTML = "";
    }

    addContentHeader(text) {
        let el = document.createElement("h1");
        el.textContent = text;
        el.classList.add("settings-content-header");
        this.content.appendChild(el);

        // also change window title
        this.win.setTitle("System Settings - "+text);
    }

    addDescription(text) {
        let el = document.createElement("p");
        el.textContent = text;
        el.classList.add("settings-content-description");
        this.content.appendChild(el);
        return el;
    }

    addSection(text) {
        let el = document.createElement("p");
        el.textContent = text;
        el.classList.add("settings-content-section");
        this.content.appendChild(el);
    }

    addSwitch(defaultValue, callback) {
        let container = document.createElement("div");
        container.style.textAlign = "center";

        let el = document.createElement("input");
        el.type = "checkbox";
        el.classList.add("switch");
        el.checked = defaultValue;

        el.onclick = ()=>{
            callback(el.checked);
        }
        container.appendChild(el);
        this.content.appendChild(container);
    }

    addImageSelect(arrOfSrc, callback) {
        const clickHandler = function () {
            callback(this.src, this.getAttribute("path"));
            // remove old
            Array.from(container.childNodes).filter((node)=>{return !node.filter}).forEach((node)=>{
                node.style.filter = "";
            });
            // add new
            Array.from(container.childNodes).filter((node)=>{return node.childNodes[0].src.replace("thumb", "") == desktopBackground.src})[0].style.filter = "drop-shadow(1px 1px 0 var(--select)) drop-shadow(1px -1px 0 var(--select)) drop-shadow(-1px 1px 0 var(--select)) drop-shadow(-1px -1px 0 var(--select))";
        }

        let container = document.createElement("div");
        container.classList.add("settings-highlight");

        arrOfSrc.forEach((src)=>{
            let c = document.createElement("div");
            c.style.display = "inline-block";
            if(src == "upload") {
                let general = JSON.parse(folders["/etc/general.json/"].content);
                let invisC = document.createElement("div");
                invisC.style.display = general["isBgCustom"] ? "inline-block" : "none";
                let img = document.createElement("img");
                img.classList.add("settings-image");
                img.onclick = clickHandler;
                img.draggable = false;
                if(general["isBgCustom"]) {
                    img.src = objectURLS[general["bg"]];
                    img.setAttribute("path", general["bg"]);
                }
                invisC.appendChild(img);
                container.appendChild(invisC);

                c.style.display = "block";
                c.style.width = "100%";
                c.style.textAlign = "center";

                let button = document.createElement("button");
                button.textContent = "Choose File";
                button.src = "";
                button.style.display = "inline-block";
                button.onclick = ()=>{
                    FileSystemGUI.requestFile("Image")
                    .then((path)=>{
                        invisC.style.display = "inline-block";

                        if(objectURLS[path]) {
                            img.src = objectURLS[path];
                            img.setAttribute("path", path);
                            clickHandler.bind({src: objectURLS[path]})();
                        } else {
                            let url = URL.createObjectURL(files[path]);
                            objectURLS[path] = url;
                            img.src = url;
                            clickHandler.bind({src: url})();
                        }
                        
                    })
                    .catch((e)=>{
                        // is expected
                    });
                }
                c.appendChild(button);
            } else {
                let img = document.createElement("img");
                img.classList.add("settings-image");
                img.onclick = clickHandler;
                img.src = src;
                img.draggable = false;
                c.appendChild(img);
            }
            container.appendChild(c);
        });

        // set correct one
        Array.from(container.childNodes).filter((node)=>{return node.childNodes[0].src.replace("thumb", "") == desktopBackground.src})[0].style.filter = "drop-shadow(1px 1px 0 var(--select)) drop-shadow(1px -1px 0 var(--select)) drop-shadow(-1px 1px 0 var(--select)) drop-shadow(-1px -1px 0 var(--select))";
        
        this.content.appendChild(container);
    }

    addSlider(min, max, step, value, callback) {
        let container = document.createElement("div");
        container.style.textAlign = "center";

        let el = document.createElement("input");
        el.max = max;
        el.min = min;
        el.value = value;
        el.step = step;
        el.type = "range";
        el.classList.add("settings-slider");

        el.oninput = ()=>{
            callback(el.value);
        };
        container.appendChild(el);
        this.content.appendChild(container);
    }

    addButton(text, callback) {
        let container = document.createElement("div");
        container.style.textAlign = "center";

        let el = document.createElement("button");
        el.textContent = text;
        el.style.display = "inline-block";
        el.onclick = ()=>{
            callback();
        }
        container.appendChild(el);

        this.content.appendChild(container);
    }

    addHighlight() {
        const clickHandler = function () {
            container.querySelector(".settings-circle-selected").classList.remove("settings-circle-selected");
            this.classList.add("settings-circle-selected");

            setSelect(this.style.backgroundColor);
            
            save("general", "highlightColor", highlightColor);
        }

        let container = document.createElement("div");
        container.classList.add("settings-highlight");

        let circ1 = document.createElement("div");
        circ1.classList.add("settings-circle");
        circ1.style.backgroundColor = "rgb(0, 89, 221)";
        circ1.onclick = clickHandler;
        container.appendChild(circ1);

        let circ2 = document.createElement("div");
        circ2.classList.add("settings-circle");
        circ2.style.backgroundColor = "rgb(168, 23, 226)";
        circ2.onclick = clickHandler;
        container.appendChild(circ2);

        let circ3 = document.createElement("div");
        circ3.classList.add("settings-circle");
        circ3.style.backgroundColor = "rgb(221, 26, 0)";
        circ3.onclick = clickHandler;
        container.appendChild(circ3);

        let circ4 = document.createElement("div");
        circ4.classList.add("settings-circle");
        circ4.style.backgroundColor = "rgb(9, 155, 135)";
        circ4.onclick = clickHandler;
        container.appendChild(circ4);

        let circ5 = document.createElement("div");
        circ5.classList.add("settings-circle");
        circ5.style.backgroundColor = "rgb(16, 161, 23)";
        circ5.onclick = clickHandler;
        container.appendChild(circ5);

        // set correct one
        Array.from(container.childNodes).filter((node)=>{return node.style.backgroundColor == highlightColor})[0].classList.add("settings-circle-selected");
        
        this.content.appendChild(container);

    }
}

function save(filename, key, value) {
    let path = "/etc/"+filename+".json/";
    let content = JSON.parse(folders[path].content);
    content[key] = value;
    FileSystem.updateContent(path, JSON.stringify(content));
}

function setSelect(bgcolor) {
    document.body.style.setProperty("--select", bgcolor);
    highlightColor = bgcolor;
    let rgb = highlightColor.match(/\((?:(\d{1,3}), (\d{1,3}), (\d{1,3})\))/);
    rgb.splice(0, 1);
    document.body.style.setProperty("--select-r", rgb[0]);
    document.body.style.setProperty("--select-g", rgb[1]);
    document.body.style.setProperty("--select-b", rgb[2]);
}

document.addEventListener("file-system-ready", ()=>{
    performanceModeEnabled = JSON.parse(folders["/etc/general.json/"].content).performanceModeEnabled;
    highlightColor = JSON.parse(folders["/etc/general.json/"].content).highlightColor;
    setSelect(highlightColor);
}, {once: true});

appImagePaths["System Settings"] = "assets/settings.png";
makeFunctions["System Settings"] = ()=>{ new SystemSettings; };

GlobalStyle.newClass("settings-container", "display: flex;", "flex-wrap: wrap;");
GlobalStyle.newClass("settings-sidebar", "flex: 2;", "background-color: rgba(0,0,0,0.1);", "min-width:9em;", "max-width: 14em;", "height: 100%;", "overflow-y: auto;");
GlobalStyle.newClass("settings-sidebar-item", "font-weight: bold;", "font-size: 1.2em;", "padding: 0.5em;", "display: block;", "cursor: pointer;", "white-space: nowrap;", "overflow: hidden;", "text-overflow: ellipsis;");
GlobalStyle.newClass("settings-sidebar-item-selected", "background-color: var(--select);", "color: white;");
GlobalStyle.newClass("settings-content", "flex: 5;", "overflow-y: auto;", "overflow-x: hidden;", "padding-bottom: 1em;", "height: calc(100% - 1.2em);");
GlobalStyle.newClass("settings-content-description", "text-align: center;", "color: rgba(0,0,0,0.6);", "font-size: 0.6em;", "margin: 0 10%;");
GlobalStyle.newClass("settings-content-section", "text-align: center;", "color: rgba(0,0,0,1);", "font-size: 1em;", "margin-top: 3em;", "margin-bottom: 0.3em;");
GlobalStyle.newClass("settings-content-header", "text-align: center;", "margin-top: 0.4em;", "font-size: 2em;");
GlobalStyle.newClass("settings-circle", "border-radius: 50%;", "width: 1.3em;", "height: 1.3em;", "display: inline-block;", "box-sizing: border-box;", "cursor: pointer;", "border: 2px solid white;");
GlobalStyle.newClass("settings-circle-selected", "border: 2px solid black;");
GlobalStyle.newClass("settings-image", "clip-path: circle(1.5em at center);", "height: 4em;", "display: inline-block;", "cursor: pointer;", "max-width: 4em;", "object-fit: cover;");
GlobalStyle.newClass("settings-image-selected", "border: 2px solid black;");
GlobalStyle.newClass("settings-highlight", "display: flex;", "justify-content: space-around;", "width: 60%;", "margin: 0 auto;", "flex-wrap: wrap;");
// The below was made with http://danielstern.ca/range.css/#/
GlobalStyle.addRaw(`
.settings-slider {
    max-width: 60%;
}
input[type=range].settings-slider {
    width: 100%;
    margin: 11.8px 0;
    background-color: transparent;
    -webkit-appearance: none;
  }
  input[type=range].settings-slider:focus {
    outline: none;
  }
  input[type=range].settings-slider::-webkit-slider-runnable-track {
    background: rgba(0, 0, 0, 0.3);
    border: 0;
    border-radius: 4.2px;
    width: 100%;
    height: 8.4px;
    cursor: pointer;
  }
  input[type=range].settings-slider::-webkit-slider-thumb {
    margin-top: -11.8px;
    width: 14px;
    height: 32px;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.3);
    border-radius: 3px;
    cursor: pointer;
    -webkit-appearance: none;
  }
  input[type=range].settings-slider:focus::-webkit-slider-runnable-track {
    background: #0d0d0d;
  }
  input[type=range].settings-slider::-moz-range-track {
    background: rgba(0, 0, 0, 0.3);
    border: 0;
    border-radius: 4.2px;
    width: 100%;
    height: 8.4px;
    cursor: pointer;
  }
  input[type=range].settings-slider::-moz-range-thumb {
    width: 14px;
    height: 32px;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.3);
    border-radius: 3px;
    cursor: pointer;
  }
  input[type=range].settings-slider::-ms-track {
    background: transparent;
    border-color: transparent;
    border-width: 12.8px 0;
    color: transparent;
    width: 100%;
    height: 8.4px;
    cursor: pointer;
  }
  input[type=range].settings-slider::-ms-fill-lower {
    background: #000000;
    border: 0;
    border-radius: 8.4px;
  }
  input[type=range].settings-slider::-ms-fill-upper {
    background: rgba(0, 0, 0, 0.3);
    border: 0;
    border-radius: 8.4px;
  }
  input[type=range].settings-slider::-ms-thumb {
    width: 14px;
    height: 32px;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.3);
    border-radius: 3px;
    cursor: pointer;
    margin-top: 0px;
    /*Needed to keep the Edge thumb centred*/
  }
  input[type=range].settings-slider:focus::-ms-fill-lower {
    background: rgba(0, 0, 0, 0.3);
  }
  input[type=range].settings-slider:focus::-ms-fill-upper {
    background: #0d0d0d;
  }
  @supports (-ms-ime-align:auto) {
    /* Pre-Chromium Edge only styles, selector taken from hhttps://stackoverflow.com/a/32202953/7077589 */
    input[type=range].settings-slider {
      margin: 0;
      /*Edge starts the margin from the thumb, not the track as other browsers do*/
    }
  }
  `)
}());

var performanceModeEnabled = false;
var highlightColor = "rgba(0, 89, 221, 1)";
var volume = 75;