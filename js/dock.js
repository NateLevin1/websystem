class Dock {
    create() {
        this.bar = document.createElement("div");
        this.bar.classList.add("dock-bar", "heavy-blurred", "unselectable");
        document.body.appendChild(this.bar);

        this.pinnedApps = dockApps;
        this.pinnedIcons = {};
        this.openIconReference = {};

        this.createMenu();

        dockApps.forEach((path)=>{
            if(folders[path]) { // ignores "|"s
                this.addDefaults(folders[path].name);
            }
            this.appendApp(path, "", true);
        });

        // change listener
        document.addEventListener("window-open-change", (event)=>{
            let {type, affectedAppsPath: path, originWindow:window} = event.actions;
            
            if(this.openIconReference[path] === undefined) {
                // not already an array, this will through an error if it isn't fixed here
                this.openIconReference[path] = [];
            }

            if(type == "open") {
                if(this.openIconReference[path].length == 0) {
                    setTimeout(()=>{ // wait to see if handled. If handled do nothing, otherwise add the app
                        if(this.openIconReference[path].length == 0) {
                            // not handled
                            if(this.pinnedApps.includes(path)) {
                                // is pinned, open in the existing pinned app
                                this.pinnedIcons[path].setOriginWindow(window);
                            } else {
                                this.appendApp(path, window);
                            }
                        }
                    }, 10);
                } else if(this.openIconReference[path].length >= 1) {
                    this.insertAppBefore(path, this.openIconReference[path][0].element.nextSibling, window);
                }
            }
        });
    }

    createApp(pathToApp, originWindow=null, isPinned=false) {
        if(pathToApp == "|") {
            // make separator
            let separator = document.createElement("div");
            separator.classList.add("dock-separator");
            return separator;
        } else {
            let name = folders[pathToApp].name;
            let src = appImagePaths[name];
            let isOpen = !isPinned;

            if(this.openIconReference[pathToApp] === undefined) {
                this.openIconReference[pathToApp] = [];
            }

            let container = document.createElement("div");
            container.classList.add("dock-app-container");
            container.title = name;

            const changeHandler = (event)=>{
                if(isOpen && event.actions.type == "close" && event.actions.originWindow == originWindow) {
                    thumbnail.style.animation = "";
                    if(isPinned) {
                        isOpen = false;
                        originWindow = null;
                    } else {
                        container.style.animation = "fade-out 0.3s, move-app-left 0.3s";
                        container.style.position = "absolute"; // remove from flow
                        container.style.zIndex = "-1";
                        setTimeout(()=>{
                            container.remove();
                        }, 280);
                        // ? allow for garbage collection?
                        document.removeEventListener("window-open-change", changeHandler);
                    }
                    this.openIconReference[pathToApp].splice(this.openIconReference[pathToApp].indexOf({element: container}), 1);

                }
            };
            document.addEventListener("window-open-change", changeHandler);    

            const originSetter = (event)=>{
                if(event.actions.type == "open") {
                    setOrigin(event.actions.originWindow);
                }
            };
            const setOrigin = (ogWin)=>{
                this.openIconReference[pathToApp].push({element: container})
                originWindow = ogWin;
                isOpen = true;
                this.triggerAppAnimation(thumbnail);
            }

            if(!isPinned) {
                this.openIconReference[pathToApp].push({element: container});
            } else {
                this.pinnedIcons[pathToApp] = {element: container, setOriginWindow: setOrigin}
            }
            
            container.onmousedown = (event)=>{
                if(!isOpen) {
                    if(!originWindow && event.detail == 1 && event.which == 1) { // don't open twice on double click and only allow if left click
                        document.addEventListener("window-open-change", originSetter, {once: true});    
                        makeFunctions[name]();
                    }
                } else {
                    if(event.detail == 3 && event.which == 1) {
                        // open another on triple click
                        makeFunctions[name]();
                    }
                    originWindow.dispatchFocus();
                }
            }

            container.oncontextmenu = (event)=>{
                event.preventDefault();
                this.showMenu(event, name, container, originWindow);
            }

            let thumbnail = document.createElement("img");
            thumbnail.src = src;
            thumbnail.draggable = false;
            thumbnail.classList.add("dock-app-thumbnail");
            if(!isPinned) {
                this.triggerAppAnimation(thumbnail);
            }
            container.appendChild(thumbnail);

            return container;
        }
    }

    triggerAppAnimation(thumbnail) {
        void thumbnail.offsetWidth; // this is a hack to trigger reflow so the anim can be replayed. See https://css-tricks.com/restart-css-animation/
        thumbnail.style.animation = "bounce 2s";
        thumbnail.style.animationIterationCount = "3";
        thumbnail.style.animationTimingFunction = "ease";
    }

    appendApp(pathToApp, originWindow={}, isPinned=false) {
        this.bar.appendChild(this.createApp(pathToApp, originWindow, isPinned));
    }

    insertAppBefore(pathToApp, beforeNode, originWindow={}, isPinned=false) {
        this.bar.insertBefore(this.createApp(pathToApp, originWindow, isPinned), beforeNode);
    }


    // RIGHT CLICK
    createMenu() {
        let menu = document.createElement("div");
        menu.classList.add("dock-menu", "heavy-blurred");
        menu.style.display = "none";
        this.menu = menu;
        document.body.appendChild(menu);
    }
    showMenu(event, appName, icon, originWindow) {
        let isOpen = false;
        if(originWindow) {
            isOpen = true;
        }
        this.menu.style.left = (icon.getBoundingClientRect().left+em/2)+"px";
        this.menu.style.display = "inline-block";
        this.menu.innerHTML = "";
        this.menu.style.animation = "fade-in 0.1s";
        this.addToMenuByName((appName+"-")+(isOpen ? "open" : "closed"));

        let downTime = event.timeStamp;
        document.addEventListener("mouseup", (ev)=>{
            let totalTime = Math.round(ev.timeStamp - downTime);
            if(totalTime > 200) {
                this.getMenuSelected(originWindow);
            } else {
                // stay until click
                document.addEventListener("mouseup", (ev)=>{
                    this.getMenuSelected(originWindow);
                }, {once: true});
            }
        }, {once: true});
    }

    getMenuSelected(originWindow) {
        this.menu.childNodes.forEach((node)=>{
            if(isHover(node)) {
                rightClickSelect.originWindow = originWindow;
                node.dispatchEvent(rightClickSelect);
            }
        });
        this.closeMenu();
    }

    closeMenu() {
        this.menu.style.animation = "fade-out 0.3s";
        setTimeout(()=>{
            this.menu.style.display = "none";
            this.menu.style.animation = "";
        }, 280);
    }

    /**
     * Add text to the dock's right click menu and run the callback when it is selected.
     * @param {String} appName - The app's name followed by "-open" or "-closed"
     * @param {String} text 
     * @param {Function} callback - The origin Window instance (the class, not the element) is passed in as the first argument.
     */
    static addTextToMenuForApp(appName, text, callback) {
        let el = document.createElement("div");
        el.classList.add("right-click-menu-member");
        el.textContent = text;
        if(menuContent[appName] === undefined) {
            menuContent[appName] = [];
        }
        el.addEventListener("right-click-select", (event)=>{callback(event.originWindow)});
        menuContent[appName].push(el);
    }

    static addLineToMenuForApp(appName) {
        let el = document.createElement("div");
        el.classList.add("right-click-menu-member-no-hover");
        if(menuContent[appName] === undefined) {
            menuContent[appName] = [];
        }
        menuContent[appName].push(el);
    }

    addToMenuByName(name) {
        menuContent[name].forEach((el)=>{
            this.menu.appendChild(el);
        });
    }

    /**
     * Add the default options if it doesn't have any
     * @param {String} appName 
     */
    addDefaults(appName) {
        if(!menuContent[appName+"-open"]) {
            Dock.addTextToMenuForApp(appName+"-open", "New Window", ()=>{makeFunctions[appName]();})
            Dock.addLineToMenuForApp(appName+"-open");
            Dock.addTextToMenuForApp(appName+"-open", "Force Close", (windowReference)=>{windowReference.forceClose();})
            Dock.addTextToMenuForApp(appName+"-open", "Close", (windowReference)=>{windowReference.close();})
        }
        if(!menuContent[appName+"-closed"]) {
            Dock.addTextToMenuForApp(appName+"-closed", "Open", ()=>{makeFunctions[appName]();})
        }
    }

    /**
     * Remove the default dock right click menu items.
     * @param {String} appName 
     * @param {Object} options 
     * @param {Boolean} options.removeBoth - If true, removes both the "-open" and "-closed" menu items.
     * @param {Boolean} options.removeOpen - If true, removes the "-open" menu items.
     * @param {Boolean} options.removeClosed - If true, removes the "-closed" menu items.
     */
    static removeDefaults(appName, options) {
        // the below could probably become an else if, but this is more forgiving for beginners IMO
        if(options.removeBoth) {
            menuContent[appName+"-open"] = []
            menuContent[appName+"-closed"] = [];
        } 
        if(options.removeOpen) {
            menuContent[appName+"-open"] = [];
        }
        if(options.removeClosed) {
            menuContent[appName+"-closed"] = [];
        }
    }
}

let menuContent = {};

let dock = new Dock;
document.addEventListener("file-system-ready", ()=>{
    dock.create();
});

let dockApps = [
    "/Users/"+NAME+"/Applications/File Viewer.app/",
    "|",
    "/Users/"+NAME+"/Applications/Documenter.app/",
    // "/Users/"+NAME+"/Applications/Calculator.app/",
    "/Users/"+NAME+"/Applications/App Store.app/",
    "/Users/"+NAME+"/Applications/Music.app/",
    "/Users/"+NAME+"/Applications/Image Viewer.app/"
]