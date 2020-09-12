// CSS
GlobalStyle.newClass("appstore-sidebar", "height:calc(100% - 1.2em); width:30%; border-right:5px solid black; box-sizing: border-box; display:inline-block; background-color: darkgray; overflow:auto; vertical-align:top;");
GlobalStyle.newClass("appstore-main", "height:calc(100% - 1.1em); width:70%; box-sizing: border-box; overflow: auto; display:inline-block; border-bottom:2px solid white;");
GlobalStyle.newClass("appstore-search", "border: 2px solid black; border-radius:20px; outline: none; -webkit-appearance: none; width:90%; height:10%; font-size:1em; margin-top: 5%; margin-left: 5%; margin-right: 5%; text-align: center; transition: text-align 1s;");
GlobalStyle.newClass("appstore-search:focus", "text-align: left;");
GlobalStyle.newClass("appstore-menuitem", "background-color:white; border:2px solid black; color:black; height:20%; font-size: 1.5em; width:80%; margin-top:10%; margin-left:auto; margin-right:auto; display: flex; justify-content: center; align-content: center; flex-direction: column; text-align: center; transition: background-color 0.1s, color 0.1s, border-color 0.1s;");
GlobalStyle.newClass("appstore-menuitem-selected", "background-color:black; color:white; border:2px solid white;")
GlobalStyle.newClass("appstore-app-container", "margin-top:7%; margin-left:3%;", "display: flex;", "align-items: center;", "position: relative")
GlobalStyle.newClass("appstore-thumbnail", "max-height:4em;", "max-width:4em;");
GlobalStyle.newClass("appstore-text-container", "display: inline-block; width:calc(80% - 7.8em); margin-left:5%;");
GlobalStyle.newClass("appstore-title", "font-size:1.3em; color: black; display:block;", "max-width: 100%;", "overflow: hidden;", "white-space: no-wrap;", "text-overflow: ellipsis;");
GlobalStyle.newClass("appstore-desc", "font-size:0.7em; color: rgb(150,150,150); display:inline-block; width:70%;");
GlobalStyle.newClass("appstore-install", "padding:0.3em; font-size: 1.3em; background-color: rgb(3, 161, 252); display: inline-block; transition: background-color 0.3s; min-width:3.8em; width: 20%;", "position: absolute;", "right:1em;");
GlobalStyle.newClass("appstore-installed", "background-image: linear-gradient(0, rgb(calc(var(--select-r) * 1.1), calc(var(--select-g) * 1.1), calc(var(--select-b) * 1.1)), rgb(min(230, calc(var(--select-r) * 1.4)), min(230, calc(var(--select-g) * 1.4)), min(230, calc(var(--select-b) * 1.4)))); border-color: rgb(calc(var(--select-r) * 1), calc(var(--select-g) * 0.98), calc(var(--select-b) * 0.9)); color: white;");

class Appstore {
    constructor() {
        let win = new Window(400, 300, "App Store", 25, 25, {x: 5, y: 2.2, topBarCreator: this.createTopBar, thisContext: this, pathToApp: "/Users/"+NAME+"/Applications/App Store.app/"});
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
        this.search = search;

        search.onpointerdown = ()=>{
            this.newSelected("search");
        }

        search.oninput = ()=>{
            this.newSelected(search.value);
        }

        let popular = document.createElement("div");
        popular.classList.add("appstore-menuitem", "appstore-menuitem-selected");
        popular.innerHTML = "🎈Popular";
        sidebar.appendChild(popular);
        this.popular = popular;
        this.menuLocation = "popular";

        popular.onpointerdown = ()=>{
            this.newSelected("popular");
        }

        let recent = document.createElement("div");
        recent.classList.add("appstore-menuitem");
        recent.innerHTML = "🎉 Recent";
        sidebar.appendChild(recent);
        this.recent = recent;

        recent.onpointerdown = ()=>{
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
        this.window.querySelector(".appstore-menuitem-selected").classList.remove("appstore-menuitem-selected");
        this.apps = [];
        this.main.innerHTML = "";
        if(OFFLINE) {
            this.showServerError("You are not connected to the internet.");
            this[str == "popular" || str == "recent" ? str : "search"].classList.add("appstore-menuitem-selected");
            return undefined;
        }
        if(str == "popular") {
            this.popular.classList.add("appstore-menuitem-selected");
            fetch("/backend/appstore/popular.json")
            .then(function(response) {
                return response.json();
            })
            .then((data)=>{
                this.pushApps(data);
                // get the data from server
                // set the data to the app array
                this.showCurrentMenu();
            })
            .catch(()=>{
                this.showServerError();
            });
        } else if(str == "recent") {
            this.recent.classList.add("appstore-menuitem-selected");
            fetch("/backend/appstore/recent.json")
            .then(function(response) {
                return response.json();
            })
            .then((data)=>{
                this.pushApps(data);
                // get the data from server
                // set the data to the app array
                this.showCurrentMenu();
            })
            .catch(()=>{
                this.showServerError();
            });
        } else {
            this.search.classList.add("appstore-menuitem-selected");
            // custom search
            if(this.searchList === undefined) {
                fetch("/backend/appstore/recent.json")
                .then(function(response) {
                    return response.json();
                })
                .then((data)=>{
                    this.searchList = data;
                    this.pushApps(data);
                    // get the data from server
                    // set the data to the app array
                    this.searchData(str);
                    this.showCurrentMenu();
                })
                .catch(()=>{
                    this.showServerError();
                });
            } else {
                this.pushApps(this.searchList);
                // get the data from server
                // set the data to the app array
                this.searchData(str);
                this.showCurrentMenu();
            }
            
        }
    }

    showServerError(content="There was an error connecting to the server.") {
        this.showCurrentMenu();
        let txt = document.createElement("p");
        txt.textContent = content;
        txt.style.textAlign = "center";
        txt.style.padding = "1em";
        this.main.appendChild(txt);
    }
    /**
     * @ignore
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

        let description = document.createElement("a");
        description.innerText = desc;
        description.setAttribute("total-content", desc);
        description.classList.add("appstore-desc");
        textContainer.appendChild(description);

        
        let install = document.createElement("button");
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
        let scr = document.createElement("script");
        scr.innerHTML = script;
        document.body.appendChild(scr);
        if(!folders["/Users/"+NAME+"/Applications/"+title+".app/"]) {
            // next, add to filesystem
            FileSystem.addFileAtLocation(title+".app", script, "App", "/Users/"+NAME+"/Applications/", { alias: title });
        }

        // finally, update the app store button from install to open
        if(button) {
            button.classList.add("appstore-installed");
            button.innerText = "Open";
            let ogClick = button.onclick;
            button.onclick = ()=>{
                if(!makeFunctions[title]) {
                    button.classList.remove("appstore-installed");
                    button.innerText = "Install";
                    button.onclick = ogClick;
                } else {
                    makeFunctions[title]();
                }
            }
            setTimeout(()=>{
                if(!makeFunctions[title]) {
                    button.classList.remove("appstore-installed");
                    button.innerText = "Install";
                    button.onclick = ogClick;
                }
            }, 30);
        }
    }

    createTopBar() {
        TopBar.addToTop("File", "file");
        TopBar.addToMenu("Close Window", "file", ()=>{ this.win.close(); });

        TopBar.addToTop("View", "view");
        TopBar.addToMenu("Popular", "view", ()=>{ this.newSelected("popular"); });
        TopBar.addToMenu("Recent", "view", ()=>{ this.newSelected("recent"); });
        TopBar.addToMenu("Search", "view", ()=>{
            this.window.querySelector(".appstore-menuitem-selected").classList.remove("appstore-menuitem-selected");
            this.search.classList.add("appstore-menuitem-selected");
            setTimeout(()=>{
                this.search.focus();
            }, 50);
        });

        TopBar.addToTop("Help", "help");
        TopBar.addToMenu("About App Store", "help", ()=>{ About.newWindow("App Store", "The official App Store for WebSystem.", "1.0", "assets/appstore.png"); });
    }
}
appImagePaths["App Store"] = "assets/appstore.png";
makeFunctions["App Store"] = ()=>{ new Appstore; };


//jsonEscapeNewlines(Appstore+"\n"+makeAppstore+"\nappImagePaths[\"App Store\"] = \"assets/appstore.png\";\nmakeFunctions[\"App Store\"] = ()=>{ makeAppstore(); };");