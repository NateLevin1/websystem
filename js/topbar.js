class TopBar {
    constructor() { // ran on boot
        let bar = document.createElement("div");
        bar.classList.add("top-bar", "heavy-blurred");
        document.body.appendChild(bar);
        TopBar.bar = bar;

        TopBar.menuItems = {};
        TopBar.unclickables = [];
        let menu = document.createElement("div");
        menu.classList.add("top-bar-menu", "unselectable", "heavy-blurred");
        menu.style.display = "none";
        document.body.appendChild(menu);
        TopBar.menu = menu;


        let curDate = new Date;
        let curHours = curDate.getHours();
        let amOrPm = "AM";
        if(curHours > 12) {
            curHours -= 12;
            amOrPm = "PM"
        }
        let dayName = new Intl.DateTimeFormat('en-US', {weekday: "short"}).format(curDate);

        let time = document.createElement("div");
        time.innerText = dayName+" "+curHours+":"+curDate.getMinutes().toString().padStart(2, "0")+" "+amOrPm;
        time.classList.add("top-bar-time", "unselectable");
        bar.appendChild(time);

        let wifi = document.createElement("img");
        if(window.navigator.onLine) {
            wifi.src = "assets/filledWifi.svg";
        } else {
            wifi.src = "assets/emptyWifi.svg";
        }
        wifi.classList.add("top-bar-wifi", "unselectable");
        bar.appendChild(wifi);

        if(window.Worker) { // ? Do we even need this polyfill?
            let constantUpdates = new Worker('js/constantUpdates.js');
            constantUpdates.onmessage = (event) => {
                if(event.data[0] === "T") {
                    time.innerText = event.data.substring(1);
                } else if(event.data[0] == "O") {
                    switch(event.data[1]) {
                        case true:
                            if(wifi.src != "assets/filledWifi.svg") {
                                wifi.src = "assets/filledWifi.svg";
                                OFFLINE = false;
                                
                            }
                            break;
                        case false:
                            if(wifi.src != "assets/emptyWifi.svg") {
                                wifi.src = "assets/emptyWifi.svg";
                                OFFLINE = true;
                            }
                            break;
                    }
                }
            }
        }

        let info = document.createElement("div");
        info.innerText = "⚫";
        info.classList.add("top-bar-top-item", "unselectable", "top-bar-info");
        bar.appendChild(info);
        TopBar.addListenerForItem({el: info, name:"info"});

        TopBar.addToMenu("About WebSystem", "info", ()=>{ 
            console.log("Create new window with about");
        });
        TopBar.addLineToMenu("info");
        TopBar.addToMenu("Go To Github", "info", ()=>{ 
            window.open("https://github.com/UltimatePro-Grammer/websystem", '_blank');
        });
        TopBar.addToMenu("DEBUG: Delete All Data", "info", ()=>{ 
            FileSystem.clearAll();
            sessionStorage.clear();
            setTimeout(()=>{
                location.reload(false);
            }, 100);
        });
    }
    /**
     * Clear the top bar of all things other than the time and info.
     */
    static clear() {
        while(TopBar.bar.lastChild != document.querySelector(".top-bar-info")) {
            TopBar.bar.lastChild.remove();
        }
    }
    /**
     * Show a line in a menu.
     * @param {String} from - The key representing when to show the line.
     */
    static addLineToMenu(from) {
        let el = document.createElement("hr");
        el.classList.add("top-bar-menu-line");
        this.menuItems[from].push({"el":el});
    }

    static addToMenu(element, from, callback, options={clickable: true}) {
        if(typeof element == "string") {
            let newEl = document.createElement("div");
            newEl.innerText = element;
            newEl.classList.add("top-bar-menu-item");
            element = newEl;
        }
        this.menuItems[from].push({el: element});
        if(options.clickable) {
            element.addEventListener("menu-select", ()=>{
                callback();
            });
        } else {
            this.unclickables.push(element);
        }
        return element; // allows for changing after creation
    }

    static addToMenuIf(booleanFunction, element, from, callback, options={clickable: true, thisContext: this}) {
        options.clickable = options.clickable === undefined ? true : options.clickable;
        if(typeof element == "string") {
            let newEl = document.createElement("div");
            newEl.innerText = element;
            newEl.classList.add("top-bar-menu-item");
            element = newEl;
        }
        this.menuItems[from].push({el: element, boolFunc: booleanFunction.bind(this)});
        if(options.clickable) {
            element.addEventListener("menu-select", ()=>{
                callback();
            });
        } else {
            this.unclickables.push(element);
        }
        return element; // allows for changing after creation
    }

    static addToTop(innerText, key) {
        let el = document.createElement("div");
        el.innerText = innerText;
        el.classList.add("top-bar-top-item", "unselectable", "top-bar-top-specific-item");
        TopBar.bar.appendChild(el);
        TopBar.addListenerForItem({el: el, name: key});
    }

    static addListenerForItem(obj) {
        let item = obj.name;
        this.menuItems[item] = [];
        obj.el.onmousedown = (event)=>{
            this.removeOnUp = false;
            this.show = true;
            // Remove anything old
            this.menu.classList.remove("top-bar-menu-invisible");
            document.body.removeEventListener("mousedown", runSelected);
            // make sure no others are selected before selecting
            this.bar.childNodes.forEach((child)=>{
                if(child.classList.contains("top-bar-top-item-selected")) {
                    child.classList.remove("top-bar-top-item-selected");
                }
            });

            this.showMenu(item, obj.el);
            let startTime = event.timeStamp;
            document.body.addEventListener("mouseup", (event)=>{
                let pressedTime = event.timeStamp - startTime;
                if(pressedTime > 200) {
                    this.show = false;
                    this.removeOnUp = true;
                    runSelected(event);
                } else { // otherwise keep it there, wait for a mouse down to get info
                    document.body.addEventListener("mousedown", runSelected, { once: true });
                    this.show = false;
                }
            }, { once: true });
        }

        const runSelected = (event)=>{
            if(!this.show && !(this.unclickables.includes(event.target))) {
                this.removeMenu(this.menu, obj.el);
            } else if(this.unclickables.includes(event.target)) {
                // below is required because it has once: true.
                document.body.addEventListener("mousedown", runSelected, { once: true });
            }
        }
    }

    static addSecondaryListenerForItem(obj) {
        let {el, name} = obj;
        let newMenu = document.createElement("div");
        this.menuItems[name] = [];
        let allowRemove = false;
        let menuCreated = false;
        el.onmouseover = ()=>{
            if(!menuCreated) {
                menuCreated = true;
                // create menu
                newMenu = document.createElement("div");
                addListenersToNewMenu(newMenu);
                allowRemove = false;
                newMenu.classList.add("top-bar-menu", "unselectable", "heavy-blurred");
                newMenu.style.left = Math.round(el.getBoundingClientRect().right+0.2*em)+"px";
                newMenu.style.top = Math.round(el.getBoundingClientRect().top-0.2*em)+"px";
                document.body.addEventListener("mousedown", removeIfAble, { once: true });
                // add proper stuff to menu
                let elementsToAdd = this.menuItems[name];
                elementsToAdd.forEach((obj)=>{
                    if(!obj.boolFunc || obj.boolFunc()) {
                        newMenu.appendChild(obj.el);
                        obj.el.classList.remove("top-bar-menu-item-unavailable");
                    } else if(!obj.boolFunc()) { // gray out
                        newMenu.appendChild(obj.el);
                        obj.el.classList.add("top-bar-menu-item-unavailable");
                    }
                });
                // display menu
                document.body.appendChild(newMenu);

                // add listener for removing on pointerup
                document.addEventListener("pointerup", ()=>{
                    setTimeout(()=>{
                        if(this.removeOnUp) {
                            this.removeMenu(newMenu);
                            setTimeout(()=>{
                                newMenu.remove();
                                menuCreated = false;
                            }, 200);
                        }
                    },2);
                }, {once: true});
            }
        }
        
        el.onmouseout = ()=>{
            if(allowRemove) {
                newMenu.remove();
                menuCreated = false;
            }
        }
        const addListenersToNewMenu = (element)=>{
            element.onmouseover = ()=>{
                allowRemove = false;
            }
            element.onmouseout = ()=>{
                allowRemove = true;
            }
        }
        const removeIfAble = (event)=>{
            if(!this.unclickables.includes(event.target)) { // don't remove if not clickable
                this.removeMenu(newMenu);
                setTimeout(()=>{
                    newMenu.remove();
                    menuCreated = false;
                }, 200);
            } else {
                // below is required because it has once: true.
                document.body.addEventListener("mousedown", removeIfAble, { once: true });
            }
        }
    }

    static showMenu(item, element) {
        this.menu.style.display = "inline-block";
        this.menu.style.left = Math.round(element.getBoundingClientRect().x-0.2*em)+"px";
        element.classList.add("top-bar-top-item-selected");
        let elementsToAdd = this.menuItems[item];
        this.menu.innerHTML = "";
        elementsToAdd.forEach((obj)=>{
            if(!obj.boolFunc || obj.boolFunc()) {
                this.menu.appendChild(obj.el);
                obj.el.classList.remove("top-bar-menu-item-unavailable");
                let elIn = this.unclickables.lastIndexOf(obj.el);
                if(elIn != -1) { // was grayed out
                    this.unclickables.splice(elIn, 1);
                }
            } else if(!obj.boolFunc()) { // gray out
                this.menu.appendChild(obj.el);
                obj.el.classList.add("top-bar-menu-item-unavailable");
                this.unclickables.push(obj.el);
            }
        });
    }
    /**
     * 
     * @param {HTMLElement} menu - The menu for removing
     * @param {HTMLElement} [origin=undefined] - The origin of the removing. Removes 'selected' class from it.
     */
    static removeMenu(menu, origin=undefined) {
        // get whatever is hovered
        // use that info to run callback
        let children = menu.children;
        children = Array.from(children);
        children.forEach((element)=>{
            if(isHover(element)) {
                element.dispatchEvent(menuSelect);
            }
        });
        menu.classList.add("top-bar-menu-invisible");
        if(origin) {
            origin.classList.remove("top-bar-top-item-selected");
        }
        setTimeout(()=>{
            menu.style.display = "none";
            menu.classList.remove("top-bar-menu-invisible");
        }, 200);
        
    }

    static addName(title) {
        // adds a bolded name. should only be used internally
        let el = document.createElement("div");
        el.classList.add("top-bar-top-item", "top-bar-top-name", "unselectable");
        el.innerText = title;
        this.bar.appendChild(el);
    }

    static updateName(newName) {
        // updates the name. If this is desired, the Window class's method updateTopBarName() should be used instead of this method.
        this.bar.querySelector(".top-bar-top-name").innerText = newName;
    }
}

// EVENTS
// Ran whenever a menu item is selected. Used internally to call the callback function.
var menuSelect = new Event("menu-select");