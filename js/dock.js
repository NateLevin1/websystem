class Dock {
    create() {
        this.bar = document.createElement("div");
        this.bar.classList.add("dock-bar", "heavy-blurred", "unselectable");
        this.addBarRightClick();
        document.body.appendChild(this.bar);

        this.pinnedApps = account["pinned-apps"];
        this.pinnedIcons = {};
        this.unPinnedIcons = {}; // ironically, this is used for pinning icons
        this.openIconReference = {};

        this.createMenu();

        this.pinnedApps.forEach((path)=>{
            if(folders[path]) { // ignores "|"s
                this.addDefaults(folders[path].name, path);
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

    addBarRightClick() {
        Dock.addTextToMenuForApp("-", "Add Break", ()=>{
            let children = this.bar.childNodes;
            var after;
            children.forEach((child, index)=>{
                let rect = child.getBoundingClientRect();
                if(rect.left > lastX && children[index-1].getBoundingClientRect().right < lastX) {
                    after = children[index-1];
                }
            });
            if(!after) {
                after = this.bar.lastChild;
            }

            // add to pinned-apps
            let index = Array.from(children).indexOf(after);
            account["pinned-apps"].splice(index+1, 0, "|");
            FileSystem.setAccountDetail("pinned-apps", account["pinned-apps"]);

            // display it
            this.insertAppBefore("|", after.nextSibling);
        });
        let lastX = 0;
        this.bar.oncontextmenu = (event)=>{
            if(event.target == this.bar) {
                event.preventDefault();
                lastX = event.x;
                this.showMenu(event, "-", null, null, event.x - 1.1*em);
            }
        }
    }

    createApp(pathToApp, originWindow=null, isPinned=false) {
        if(pathToApp == "|") {
            // make separator
            let separator = document.createElement("div");
            separator.classList.add("dock-separator");
            separator.oncontextmenu = (event)=>{
                event.preventDefault();
                this.showMenu(event, "|", separator, separator/**<- Clever use of originWindow allows us to get the element in the callback */);
            }
            return separator;
        } else {
            let name = folders[pathToApp].name;
            let src = appImagePaths[name];
            let isOpen = !!originWindow;

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
            const getOrigin = ()=>{
                return originWindow;
            }

            const setPinned = (val)=>{
                isPinned = val;
            }
            const setPinnedIcons = ()=>{
                this.pinnedIcons[pathToApp] = {element: container, setOriginWindow: setOrigin, getOriginWindow: getOrigin, setPinned: setPinned, setUnPinnedIcons: setUnPinnedIcons}
            }
            const setUnPinnedIcons = ()=>{
                this.unPinnedIcons[pathToApp] = {element: container, setPinned: setPinned, setPinnedIcons: setPinnedIcons}
            }

            if(!isPinned) {
                this.openIconReference[pathToApp].push({element: container});
                this.unPinnedIcons[pathToApp] = {element: container, setPinned: setPinned, setPinnedIcons: setPinnedIcons}
            } else {
                this.pinnedIcons[pathToApp] = {element: container, setOriginWindow: setOrigin, getOriginWindow: getOrigin, setPinned: setPinned, setUnPinnedIcons: setUnPinnedIcons}
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
    showMenu(event, appName, icon, originWindow, customX=null) {
        let isOpen = false;
        if(originWindow) {
            isOpen = true;
        }
        if(icon) {
            this.menu.style.left = appName == "|" ? (icon.getBoundingClientRect().left - 1.2*em)+"px" : (icon.getBoundingClientRect().left+em/2)+"px";
        } else {
            this.menu.style.left = customX + "px";
        }
        this.menu.style.display = "inline-block";
        this.menu.innerHTML = "";
        this.menu.style.animation = "fade-in 0.1s";
        if(appName != "|" && appName != "-") {
            this.addToMenuByName((appName+"-")+(isOpen ? "open" : "closed"));
        } else {
            this.addToMenuByName(appName);
        }

        let downTime = event.timeStamp;
        document.addEventListener("mouseup", (ev)=>{
            let totalTime = Math.round(ev.timeStamp - downTime);
            if(totalTime > 200) {
                this.getMenuSelected(originWindow);
            } else {
                // stay until click
                document.addEventListener("mouseup", (ev)=>{
                    if(ev.which == 1) {
                        this.getMenuSelected(originWindow);
                    }
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

    returnTextToMenuForApp(appName, text, callback) {
        let el = document.createElement("div");
        el.classList.add("right-click-menu-member");
        el.textContent = text;
        if(menuContent[appName] === undefined) {
            menuContent[appName] = [];
        }
        el.addEventListener("right-click-select", (event)=>{callback(event.originWindow)});
        return el;
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
     * @param {String} appPath
     */
    addDefaults(appName, appPath) {
        let isPinned = account["pinned-apps"].includes(appPath);
        if(!menuContent[appName+"-open"]) {
            Dock.addTextToMenuForApp(appName+"-open", isPinned ? "Unpin "+appName : "Pin "+appName, !isPinned ? ()=>{this.pinApp(appPath)} : ()=>{this.unpinApp(appPath)});
            Dock.addLineToMenuForApp(appName+"-open");
            Dock.addTextToMenuForApp(appName+"-open", "New Window", ()=>{makeFunctions[appName]();})
            Dock.addLineToMenuForApp(appName+"-open");
            Dock.addTextToMenuForApp(appName+"-open", "Force Close", (windowReference)=>{windowReference.forceClose();})
            Dock.addTextToMenuForApp(appName+"-open", "Close", (windowReference)=>{windowReference.close();})
        }
        if(!menuContent[appName+"-closed"]) {
            Dock.addTextToMenuForApp(appName+"-closed", isPinned ? "Unpin "+appName : "Pin "+appName, !isPinned ? ()=>{this.pinApp(appPath)} : ()=>{this.unpinApp(appPath)});
            Dock.addLineToMenuForApp(appName+"-closed");
            Dock.addTextToMenuForApp(appName+"-closed", "Open New Window", ()=>{makeFunctions[appName]();})
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

    pinApp(path) {
        this.pinnedApps.push(path);
        FileSystem.setAccountDetail("pinned-apps", this.pinnedApps);
        this.unPinnedIcons[path].setPinned(true);
        this.unPinnedIcons[path].setPinnedIcons();
        delete this.unPinnedIcons[path];

        // change open and closed
        let name = folders[path].name;
        let openPinnedEl = menuContent[name+"-open"].filter(e=>{return e.textContent==="Pin "+name})[0];
        let openPinnedElIndex = menuContent[name+"-open"].indexOf(openPinnedEl);
        menuContent[name+"-open"].splice(openPinnedElIndex, 1, this.returnTextToMenuForApp(name, "Unpin "+name, ()=>{this.unpinApp(path)}));

        let closedPinnedEl = menuContent[name+"-closed"].filter(e=>{return e.textContent==="Pin "+name})[0];
        let closedPinnedElIndex = menuContent[name+"-closed"].indexOf(closedPinnedEl);
        menuContent[name+"-closed"].splice(closedPinnedElIndex, 1, this.returnTextToMenuForApp(name, "Unpin "+name, ()=>{this.unpinApp(path)}));
    }

    unpinApp(path) {
        this.pinnedApps.splice(this.pinnedApps.indexOf(path), 1);
        FileSystem.setAccountDetail("pinned-apps", this.pinnedApps);
        
        let container = this.pinnedIcons[path].element;

        this.pinnedIcons[path].setPinned(false);
        this.pinnedIcons[path].setUnPinnedIcons();
        if(!this.pinnedIcons[path].getOriginWindow()) {
            container.style.animation = "fade-out 0.3s, move-app-left 0.3s";
            container.style.position = "absolute"; // remove from flow
            container.style.zIndex = "-1";
            setTimeout(()=>{
                container.remove();
            }, 280);
        } else {
            // TODO: make an animation
        }
        

        delete this.pinnedIcons[path];


        // just change open, it is the only reachable one
        let name = folders[path].name;
        let openPinnedEl = menuContent[name+"-open"].filter(e=>{return e.textContent==="Unpin "+name})[0];
        let openPinnedElIndex = menuContent[name+"-open"].indexOf(openPinnedEl);
        menuContent[name+"-open"].splice(openPinnedElIndex, 1, this.returnTextToMenuForApp(name, "Pin "+name, ()=>{this.pinApp(path)}));
    }
}

let menuContent = {};

let dock = new Dock;
document.addEventListener("file-system-ready", ()=>{
    if(!account["pinned-apps"]) { // if it doesn't exist, make it
        FileSystem.setAccountDetail("pinned-apps", [
            "/Users/"+NAME+"/Applications/File Viewer.app/",
            "|",
            "/Users/"+NAME+"/Applications/Documenter.app/",
            // "/Users/"+NAME+"/Applications/Calculator.app/",
            "/Users/"+NAME+"/Applications/App Store.app/",
            "/Users/"+NAME+"/Applications/Music.app/",
            "/Users/"+NAME+"/Applications/Image Viewer.app/"
        ]);
    }
    dock.create();
});

Dock.addTextToMenuForApp("|", "Remove Break", (line)=>{
    let indexOfLine = Array.from(dock.bar.childNodes).indexOf(line);
    account["pinned-apps"].splice(indexOfLine, 1);
    FileSystem.setAccountDetail("pinned-apps", account["pinned-apps"]);
    line.remove();
});

// TODO: Add the ability to add breaks to between the two elements the user's cursor is at