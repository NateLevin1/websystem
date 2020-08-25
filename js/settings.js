(function () {
/**
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
        contentContainer.style.height = "calc(100% - 1em)";
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
            this.addDescription("Shows a placeholder when moving and resizing windows. Good for low power computers.");
        }

        const showAccount = ()=>{
            this.clearContent();
            this.selectItem(1);
            this.addContentHeader("Account");

            this.addSection("Factory Reset");
            this.addButton("Reset", ()=>{
                confirm("Are you sure you want to factory reset? This will irreversibly delete all of the data stored on this machine.")
                .then((decision)=>{
                    if(decision) {
                        // they want to continue, delete it
                        localStorage.clear();
                        sessionStorage.clear();
                        filesystem.clear();

                        alert("Data deleted. Reloading in 5 seconds...");
                        setTimeout(()=>{
                            window.location.reload(false);
                        }, 5000);
                    }
                });
            });
            this.addDescription("Deletes all data currently stored on the computer.");
        };


        // Sidebar Items
        this.addSidebarItem("General", showGeneral);
        this.addSidebarItem("Account", showAccount);
        
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
});

appImagePaths["System Settings"] = "assets/settings.png";
makeFunctions["System Settings"] = ()=>{ new SystemSettings; };

GlobalStyle.newClass("settings-container", "display: flex;", "flex-wrap: wrap;");
GlobalStyle.newClass("settings-sidebar", "flex: 2;", "background-color: rgba(0,0,0,0.1);", "min-width:9em;", "max-width: 14em;");
GlobalStyle.newClass("settings-sidebar-item", "font-weight: bold;", "font-size: 1.2em;", "padding: 0.5em;", "display: block;", "cursor: pointer;", "white-space: nowrap;", "overflow: hidden;", "text-overflow: ellipsis;");
GlobalStyle.newClass("settings-sidebar-item-selected", "background-color: var(--select);", "color: white;")
GlobalStyle.newClass("settings-content", "flex: 5;", "overflow: auto;", "padding-bottom: 1em;");
GlobalStyle.newClass("settings-content-description", "text-align: center;", "color: rgba(0,0,0,0.6);", "font-size: 0.6em;", "margin: 0 10%;");
GlobalStyle.newClass("settings-content-section", "text-align: center;", "color: rgba(0,0,0,1);", "font-size: 1em;", "margin-top: 3em;", "margin-bottom: 0.3em;");
GlobalStyle.newClass("settings-content-header", "text-align: center;", "margin-top: 0.4em;", "font-size: 2em;");
GlobalStyle.newClass("settings-circle", "border-radius: 50%;", "width: 1.3em;", "height: 1.3em;", "display: inline-block;", "box-sizing: border-box;", "cursor: pointer;", "border: 2px solid white;");
GlobalStyle.newClass("settings-circle-selected", "border: 2px solid black;");
GlobalStyle.newClass("settings-highlight", "display: flex;", "justify-content: space-around;", "width: 40%;", "margin: 0 auto;");
}());

var performanceModeEnabled = false;
var highlightColor = "rgba(0, 89, 221, 1)";