// CSS
GlobalStyle.newClass("appstore-sidebar", "height:calc(100% - 1em); width:30%; border-right:5px solid black; box-sizing: border-box; display:inline-block; background-color: darkgray; overflow:auto; vertical-align:top;");
GlobalStyle.newClass("appstore-main", "height:calc(100% - 1.1em); width:70%; box-sizing: border-box; overflow: auto; display:inline-block; border-bottom:2px solid white;");
GlobalStyle.newClass("appstore-search", "border: 2px solid black; border-radius:20px; outline: none; -webkit-appearance: none; width:90%; height:10%; font-size:1em; margin-top: 5%; margin-left: 5%; margin-right: 5%; text-align: center; transition: text-align 1s;");
GlobalStyle.newClass("appstore-search:focus", "text-align: left;");
GlobalStyle.newClass("appstore-menuitem", "background-color:white; border:2px solid black; color:black; height:20%; font-size: 1.5em; width:80%; margin-top:10%; margin-left:auto; margin-right:auto; display: flex; justify-content: center; align-content: center; flex-direction: column; text-align: center; transition: background-color 0.1s, color 0.1s, border-color 0.1s;");
GlobalStyle.newClass("appstore-menuitem-selected", "background-color:black; color:white; border:2px solid white;")
GlobalStyle.newClass("appstore-app-container", "margin-top:7%; margin-left:3%;")
GlobalStyle.newClass("appstore-thumbnail", "width:4em; height:4em;");
GlobalStyle.newClass("appstore-text-container", "display: inline-block; width:40%; margin-left:5%; vertical-align:top; margin-top:0.8em;");
GlobalStyle.newClass("appstore-title", "font-size:1.3em; color: black; display:inline-block;");
GlobalStyle.newClass("appstore-desc", "font-size:0.7em; color: rgb(150,150,150); display:inline-block; width:70%;");
GlobalStyle.newClass("appstore-install", "padding:0.3em; background-color: rgb(3, 161, 252); border: 2px solid black; border-radius: 0.3em;color: white; display: inline-block; vertical-align: top; margin-top:1.6em; transition: background-color 0.3s; min-width:4em; text-align: center;");
GlobalStyle.newClass("appstore-install:hover", "background-color: rgb(11, 145, 222);");
GlobalStyle.newClass("appstore-install:active", "background-color: rgb(20, 103, 150);");
GlobalStyle.newClass("appstore-installed", "background-color: rgb(18, 181, 18);");
GlobalStyle.newClass("appstore-installed:hover", "background-color: rgb(20, 196, 20);");
GlobalStyle.newClass("appstore-installed:active", "background-color: rgb(13, 120, 13);");

/**
 * WebSystem's App store. Includes the interface and installApp method, which is used internally to save space.
 */
class Appstore {
    constructor() {
        let win = new Window(400, 300, "App Store", 25, 25, {x: 5, y: 2.2});
        this.window = win.getWindow();
        this.header = win.getHeader();
        this.win = win;

        // * SIDEBAR
        let sidebar = document.createElement("div");
        sidebar.classList.add("appstore-sidebar", "unselectable");

        let search = document.createElement("input");
        search.type = "search";
        search.placeholder = "Search...";
        search.classList.add("appstore-search");
        sidebar.appendChild(search);

        search.onpointerdown = ()=>{
            document.querySelector(".appstore-menuitem-selected").classList.remove("appstore-menuitem-selected");
            search.classList.add("appstore-menuitem-selected");
            this.newSelected("search");
        }

        search.oninput = ()=>{
            this.newSelected(search.value);
        }

        let popular = document.createElement("div");
        popular.classList.add("appstore-menuitem", "appstore-menuitem-selected");
        popular.innerHTML = "🎈Popular";
        sidebar.appendChild(popular);

        this.menuLocation = "popular";

        popular.onpointerdown = ()=>{
            document.querySelector(".appstore-menuitem-selected").classList.remove("appstore-menuitem-selected");
            popular.classList.add("appstore-menuitem-selected");
            this.newSelected("popular");
        }

        let recent = document.createElement("div");
        recent.classList.add("appstore-menuitem");
        recent.innerHTML = "🎉 Recent";
        sidebar.appendChild(recent);

        recent.onpointerdown = ()=>{
            document.querySelector(".appstore-menuitem-selected").classList.remove("appstore-menuitem-selected");
            recent.classList.add("appstore-menuitem-selected");
            this.newSelected("recent");
        }

        // * MAIN PART
        let main = document.createElement("div");
        main.classList.add("appstore-main", "unselectable");
        this.main = main;

        this.window.appendChild(sidebar);
        this.window.appendChild(main);
        this.newSelected("popular");
    }

    showCurrentMenu() {
        this.main.innerHTML = "";
        this.apps.forEach((element) => {
            this.addApplicationToScreen(element.name, element.description, element.icon, element.script);
        });
    }

    searchData(searchString) {
        if(this.apps) {
            this.apps = this.apps.filter((element)=>{
                if((element.name).toUpperCase().includes(searchString.toUpperCase())||element.tags.includes(searchString)) {
                    return true;
                }
                return false;
            });
        } else {
            console.error("No apps value was set.");
        }
    }

    pushApps(data) {
        for(const app in data) {
            this.apps.push(data[app]);
        }
    }

    newSelected(str) {
        this.apps = [];
        this.main.innerHTML = "";
        if(str == "popular") {
            fetch("http://localhost:3000/applist/popular").then(function(response) {
                return response.json();
            }).then(function(data) {
                this.pushApps(data);
                // get the data from server
                // set the data to the app array
                this.showCurrentMenu();
            }.bind(this));
        } else if(str == "recent") {
            fetch("http://localhost:3000/applist/recent").then(function(response) {
                return response.json();
            }).then(function(data) {
                this.pushApps(data);
                // get the data from server
                // set the data to the app array
                this.showCurrentMenu();
            }.bind(this));
        } else {
            // custom search
            fetch("http://localhost:3000/applist/search").then(function(response) {
                return response.json();
            }).then(function(data) {
                this.pushApps(data);
                // get the data from server
                // set the data to the app array
                this.searchData(str);
                this.showCurrentMenu();
            }.bind(this));
        }
        
        
    }
    /**
     * @private
     * Adds an app to the app store's screen with specified title, description, and thumbnail.
     * @param {String} title - The title of the app
     * @param {String} desc - The description of the app
     * @param {String} imagesrc - The src value of the thumbnail of the app
     */
    addApplicationToScreen(title, desc="", imagesrc="x", script="") {
        let appContainer = document.createElement("div");
        appContainer.classList.add("appstore-app-container");
        
        let thumbnail = document.createElement("img");
        thumbnail.classList.add("appstore-thumbnail");
        thumbnail.src = imagesrc;
        thumbnail.alt = "The app icon could not be loaded.";
        appContainer.appendChild(thumbnail);

        let textContainer = document.createElement("div");
        textContainer.classList.add("appstore-text-container");
        appContainer.appendChild(textContainer);

        let titleText = document.createElement("a");
        titleText.classList.add("appstore-title");
        titleText.innerText = title;
        textContainer.appendChild(titleText);

        let breaker = document.createElement("br");
        textContainer.appendChild(breaker);

        let description = document.createElement("a");
        description.innerText = desc;
        description.setAttribute("total-content", desc);
        description.classList.add("appstore-desc");
        textContainer.appendChild(description);

        
        let install = document.createElement("div");
        install.classList.add("appstore-install");
        if(makeFunctions[title]) { // app exists
            install.classList.add("appstore-installed");
            install.innerText = "Open";
            install.onclick = ()=>{
                makeFunctions[title]();
            }
        } else {
            install.innerText = "Install";
            install.onclick = ()=>{
                Appstore.installApp(title, script, install);
            }
        }
        appContainer.appendChild(install);
        
        this.main.appendChild(appContainer);
        
        while(description.clientHeight > 1.8*em) {
            description.innerText = description.innerText.substring(0, description.innerText.length-6)+"...";
        }
        this.oldWindowWidth = this.window.clientWidth;
        this.window.addEventListener('window-resize', ()=>{
            if(this.window.clientWidth > this.oldWindowWidth + 3*em||this.window.clientWidth < this.oldWindowWidth - 3*em) {
                this.fixAllDescriptions();
                this.oldWindowWidth = this.window.clientWidth;
            }
        });
    }

    fixAllDescriptions() {
        var nodes = this.window.querySelectorAll(".appstore-desc");
        nodes.forEach((element)=>{
            element.innerText = element.getAttribute("total-content");
            while(element.clientHeight > 1.8*em) {
                element.innerText = element.innerText.substring(0, element.innerText.length-6)+"...";
            }
        });
    }

    /**
     * Install an app with the given script.
     * @param {String} title - The title of the app to be installed.
     * @param {String} script - The js script to be added to the document
     * @param {HTMLElement} [button=undefined] - The button to be changed from 'install' to 'open'.
     */
    static installApp(title, script, button=undefined) {
        // first, add script to document
        var scr = document.createElement("script");
        scr.innerHTML = script;
        document.body.appendChild(scr);
        // next, add to filesystem
        FileSystem.addFileAtLocation(title+".app", "", "App", "/Users/"+NAME+"/Applications/", { alias: title });

        // next, add to localStorage download apps TODO: Change below to use localForage
        let oldDownloads = localStorage.getItem('downloads');
        if(!oldDownloads.includes("app::"+title)) { // duplication happens without this
            localStorage.setItem('downloads', oldDownloads+",app::"+title);
        }

        // ? Dispatch event on document to update open fileViewer windows

        // finally, update the app store button from install to open
        if(button) {
            button.classList.add("appstore-installed");
            button.innerText = "Open";
            button.onclick = ()=>{
                makeFunctions[title]();
            }
        }
        
    }
}
function makeAppstore() {
    new Appstore;
}
// makeAppstore();
appImagePaths["App Store"] = "assets/appstore.png";
makeFunctions["App Store"] = ()=>{ makeAppstore(); };


//jsonEscapeNewlines(Appstore+"\n"+makeAppstore+"\nappImagePaths[\"App Store\"] = \"assets/appstore.png\";\nmakeFunctions[\"App Store\"] = ()=>{ makeAppstore(); };");