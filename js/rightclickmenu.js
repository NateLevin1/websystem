class RightClickMenu {
    /**
     * Adds an element to the menu. IDs are recommended.
     * Example usage:
     * RightClickMenu.addToMenu("Menu Item", ".window"); // will only show up when a window has been right clicked
     * Note that you might need to add a class to your window to be able to reference it.
     * @param {(HTMLElement|String)} element - The element to be appended to the menu. If a string uses default element.
     * @param {Array} usage - An element instance (or instances with an array) representing where to use the menu item.
     * @param {Function} callback - A callback to run when the element is clicked
     */
    static addToMenu(element, usage, callback) {
      if(!this.usages) {
        this.usages = {};
      }
      if(typeof element == "string") {
        var text = element;
        element = document.createElement("div");
        element.innerText = text;
        element.classList.add("right-click-menu-member");
      }
      if(typeof usage == "object") { // multiple usages, use foreach.
        usage.forEach((use)=>{
          if (!this.usages[use]) {
            this.usages[use] = [];
          }
          this.usages[use].push(element);
        });
      } else {
        if (!this.usages[usage]) {
          this.usages[usage] = [];
        }
        this.usages[usage].push(element);
      }
      
  
      element.addEventListener("right-click-select", ()=>{
        callback();
      });
    }
  
    static addLineToMenu(usage) {
      var element = document.createElement("hr");
      element.classList.add("right-click-menu-member-no-hover");
      if(typeof usage == "object") { // multiple usages, use foreach.
        usage.forEach((use)=>{
          if (!this.usages[use]) {
            this.usages[use] = [];
          }
          this.usages[use].push(element);
        });
      } else {
        if (!this.usages[usage]) {
          this.usages[usage] = [];
        }
        this.usages[usage].push(element);
      }
    }
  
    // Appends all of the right click menu items by the selector
    static appendAllSelectedChildren(selector) {
      let elements = this.usages[selector];
      elements.forEach((element) => {
          rightClickMenu.appendChild(element);
          this.rightClickHeight += outerHeight(element)/em;
      });
      this.rightClickMenu.style.height = this.rightClickHeight+"em";
    }
  
    static addRightClickForClass(classString, generatedString, parent) {
      var elements = parent.querySelectorAll(classString);
      elements.forEach((element)=>{
        RightClickMenu.addContextMenuListener(element, generatedString);
        element.classList.add("right-click-added");
      });
    }
  
    static updateRightClickForClass(classString, generatedString, parent) {
      var elements = parent.querySelectorAll(classString);
      elements.forEach((element)=>{
        if(!element.classList.contains("right-click-added")) {
          RightClickMenu.addContextMenuListener(element, generatedString);
        }
      });
    }
  
    static addRightClickForWindow(clickWindow, generatedWindow, toplevel=false) {
      if(!this.rightClickMenu) {
        this.rightClickMenu = rightClickMenu;
      }
      RightClickMenu.addContextMenuListener(clickWindow, generatedWindow, toplevel);
    }
    /**
     * Add the listeners for right clicking
     * @param {Element} clickWindow - The element to attach the listener to.
     * @param {string} generatedWindow - A string representing which things to append
     * @param {Boolean} toplevel - A boolean representing whether or not the event target must match clickWindow.
     */
    static addContextMenuListener(clickWindow, generatedWindow, toplevel=false) {
      clickWindow.addEventListener('contextmenu', (event)=>{
        event.preventDefault();
        if(!this.rightClickMenu.className.includes("right-click-invisible")) {
          if((toplevel)&&event.target == clickWindow||!toplevel) {
            this.rightClickTimer = 0;
            this.rightClickInterval = setInterval(()=>{ // trying to use timeStamp instead of this didn't work for some dumb reason so I have to do this
                this.rightClickTimer += 50;
            }, 50);
            // show menu
            this.rightClickMenu.classList.add("right-click-visible");
            
            // set position
            this.rightClickMenu.style.top = event.clientY+"px";
            this.rightClickMenu.style.left = event.clientX+"px";
            this.rightClickHeight = 0;
            this.rightClickMenu.style.height = "0em";
  
            this.rightClickMenu.innerHTML = "";
            RightClickMenu.appendAllSelectedChildren(generatedWindow);
            
            var pointerHandle = (event)=>{
                // run callback of clicked
                let children = this.rightClickMenu.children;
                children = Array.from(children);
                children.forEach((element)=>{
                  if(isHover(element)) {
                    element.dispatchEvent(rightClickSelect);
                  }
                });
                // stop timer
                clearInterval(this.rightClickInterval);
                // get timer
                if(this.rightClickTimer > 200) {
                    this.rightClickMenu.classList.add("right-click-slow");
                    this.rightClickMenu.classList.add("right-click-invisible");
                    this.rightClickMenu.classList.remove("right-click-visible");
                    setTimeout(()=>{
                        this.rightClickMenu.classList.remove("right-click-invisible");
                        this.rightClickMenu.classList.remove("right-click-slow");
                        this.rightClickMenu.innerHTML = "";
                    }, 400);
                } else {
                    // remove on click
                    var removeOnClick = ()=>{
                        // run callback of clicked
                        let children = this.rightClickMenu.children;
                        children = Array.from(children);
                        children.forEach((element)=>{
                          if(isHover(element)) {
                            element.dispatchEvent(rightClickSelect)
                          }
                        });
                        // ? Make below a function
                        this.rightClickMenu.classList.add("right-click-slow");
                        this.rightClickMenu.classList.add("right-click-invisible");
                        this.rightClickMenu.classList.remove("right-click-visible");
                        setTimeout(()=>{
                            this.rightClickMenu.classList.remove("right-click-invisible");
                            this.rightClickMenu.classList.remove("right-click-slow");
                            this.rightClickMenu.innerHTML = "";
                        }, 400);
                    }
                    document.body.addEventListener('pointerdown', removeOnClick, {once: true});
                }
            }
            document.body.addEventListener('pointerup', pointerHandle, {once: true});
          }
        }
      });
    }
    
  }
  var rightClickMenu = document.createElement("div");
  rightClickMenu.classList.add("right-click", "right-click-fast", "unselectable", "absolute");
  document.body.appendChild(rightClickMenu);
  
  // EVENTS
  
  // Called when an element is selected from a right click.
  // Handled internally- runs callback given in addToMenu function.
  var rightClickSelect = new Event("right-click-select");