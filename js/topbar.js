class TopBar {
    constructor() { // ran on boot
        let bar = document.createElement("div");
        bar.classList.add("top-bar", "heavy-blurred");
        document.body.appendChild(bar);
        this.bar = bar;

        this.menuItems = {};
        this.unclickables = [];
        let menu = document.createElement("div");
        menu.classList.add("top-bar-menu", "unselectable");
        menu.style.display = "none";
        document.body.appendChild(menu);
        this.menu = menu;


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


        let info = document.createElement("div");
        info.innerText = "⚫";
        info.classList.add("top-bar-top-item", "unselectable");
        bar.appendChild(info);
        this.addListenerForItem({el: info, name:"info"});

        this.addToMenu("About WebSystem", "info", ()=>{ console.log("Hello World!"); });
        this.addLineToMenu("info");
        this.addToMenu("Go To Github", "info", ()=>{ console.log("Hello World 2!"); });
        
        let name = document.createElement("div");
        name.innerText = "File";
        name.classList.add("top-bar-top-item", "unselectable");
        bar.appendChild(name);
        this.addListenerForItem({el: name, name: "file"});

        let newSelect = this.addToMenu("New  ▶", "file", undefined, {clickable: false});
        this.addSecondaryListenerForItem({el: newSelect, name:"newSelect"});
        this.addToMenu("Folder", "newSelect", ()=>{ console.log("New Folder!"); });
        this.addToMenu("File", "newSelect", ()=>{ console.log("New File!"); });

        let more = this.addToMenu("More Options ▶", "newSelect", undefined, {clickable: false});
        this.addSecondaryListenerForItem({el: more, name:"more"});
        this.addToMenu("Option 3", "more", ()=>{ console.log("Option 3!"); });
    }

    addLineToMenu(from) {
        let el = document.createElement("hr");
        el.classList.add("top-bar-menu-line");
        this.menuItems[from].push(el);
    }

    addToMenu(element, from, callback, options={clickable: true}) {
        if(typeof element == "string") {
            let newEl = document.createElement("div");
            newEl.innerText = element;
            newEl.classList.add("top-bar-menu-item");
            element = newEl;
        }
        this.menuItems[from].push(element);
        if(options.clickable) {
            element.addEventListener("menu-select", ()=>{
                callback();
            });
        } else {
            this.unclickables.push(element);
        }
        return element; // allows for changing after creation
    }

    addListenerForItem(obj) {
        let item = obj.name;
        this.menuItems[item] = [];
        obj.el.onmousedown = (event)=>{
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
                    runSelected();
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

    addSecondaryListenerForItem(obj) {
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
                newMenu.classList.add("top-bar-menu", "unselectable");
                newMenu.style.left = Math.round(el.getBoundingClientRect().right+0.2*em)+"px";
                newMenu.style.top = Math.round(el.getBoundingClientRect().top-0.2*em)+"px";
                document.body.addEventListener("mousedown", removeIfAble, { once: true });
                // add proper stuff to menu
                let elementsToAdd = this.menuItems[name];
                elementsToAdd.forEach((element)=>{
                    newMenu.appendChild(element);
                });
                // display menu
                document.body.appendChild(newMenu);
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

    showMenu(item, element) {
        this.menu.style.display = "inline-block";
        this.menu.style.left = Math.round(element.getBoundingClientRect().x-0.2*em)+"px";
        element.classList.add("top-bar-top-item-selected");
        let elementsToAdd = this.menuItems[item];
        this.menu.innerHTML = "";
        elementsToAdd.forEach((element)=>{
            this.menu.appendChild(element);
        });
    }
    /**
     * 
     * @param {HTMLElement} menu - The menu for removing
     * @param {HTMLElement} [origin=undefined] - The origin of the removing. Removes 'selected' class from it.
     */
    removeMenu(menu, origin=undefined) {
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

}

// EVENTS
// Ran whenever a menu item is selected. Used internally to call the callback function.
var menuSelect = new Event("menu-select");