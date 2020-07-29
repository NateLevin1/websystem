class Window {
    /**
     * Constructor. Make a new window
     * @param {Number} width - The minimum width in pixels.
     * @param {Number} height - The minimum height in pixels.
     * @param {String} title - The title of the window
     * @param {Number} defaultWidth - The default width of the window in em.
     * @param {Number} defaultHeight - The default width of the window in em.
     * @param {Number} x - The default x position on the screen.
     * @param {Number} y The default y position on the screen.
     * @param {Boolean} keepAspectRatio - If true, keeps the aspect ratio when resizing.
     */
    constructor(width, height, title, defaultWidth=30, defaultHeight=30, x=3, y=3, keepAspectRatio=false) {
      let window = document.createElement("div");
      window.classList.add("window", "absolute", "window-slow");
      window.style.top = y+"em";
      window.style.left = x+"em";

      let header = document.createElement("div");
      header.classList.add("window-header", "unselectable");

      let titleText = document.createElement("a");
      titleText.innerText = title;
      
      let close = document.createElement("div");
      close.classList.add("close", "unselectable", "no-move");
      
      let resize = document.createElement("div");
      resize.classList.add("resize");

      header.appendChild(titleText);
      header.appendChild(close);

      window.appendChild(header);
      window.appendChild(resize);
      mainContent.appendChild(window);

      this.lastChildNoChildren = window.lastChild;

      setTimeout(()=>{
        window.style.opacity = "1";
      }, 10);
      
      this.minWidth = width;
      this.minHeight = height;
      this.configureElement(window, header, resize, close, defaultWidth, defaultHeight, keepAspectRatio);

      this.window = window;
      this.window.header = header;
      this.window.titleText = titleText;

      // Focus/Unfocus
      this.dispatchFocus(); // when new window is opened focus by default

      this.window.onmousedown = ()=>{
        this.dispatchFocus();
      }

      document.addEventListener('window-focus', (event)=>{
        if(this.focused()) {
          if(event.window == this.window) {
            this.giveFocus();
          } else {
            this.removeFocus();
          }
        } else {
          this.removeFocus();
        }
      });
    }

    getWindow() {
      return this.window;
    }

    getHeader() {
      return this.window.header;
    }
    
    getHeaderText() {
      return this.window.titleText;
    }

    getWindowWidth() {
      return this.window.style.width;
    }

    getWindowHeight() {
      return this.window.style.height;
    }

    clear() {
      while(this.window.lastChild != this.lastChildNoChildren) {
        this.window.removeChild(this.window.lastChild);
      }
    }

    setTitle(newTitle) {
      this.window.titleText.innerText = newTitle;
    }
    
    /**
     * Set the background color of the window.
     * @param {CSS Color} color - the color to be used.
     */
    setBackgroundColor(color) {
      this.window.style.backgroundColor = color;
    }

    /**
     * Set the background color of the header.
     * @param {CSS Color} color - the color to be used.
     */
    setHeaderColor(color) {
      this.window.header.style.backgroundColor = color;
    }
    /**
     * Set the text color of the header.
     * @param {CSS Color} color - the color to be used.
     */
    setHeaderTextColor(color) {
      this.window.header.style.color = color;
    }

    // Makes a string for the window. Useful for needing a key for an object which is the window.
    makeString() {
      this.uniqueId = "window-"+Math.random();
      return this.uniqueId;
    }

    focused() {
      return this.hasFocus;
    }

    giveFocus() {
      this.hasFocus = true;
      this.window.style.zIndex = 10;
    }

    removeFocus() {
      this.hasFocus = false;
      if(this.window.style.zIndex > 2) {
        this.window.style.zIndex -= 1;
      }
    }

    dispatchFocus() {
      this.giveFocus(); // give opened window focus
      focusEvent.window = this.window;
      document.dispatchEvent(focusEvent);
    }

    /**
     * Set min width
     * @param {String} width - A string representing the width. E.g. 25px or 0.5em.
     */
    setMinWidth(width) {
      this.minWidth = width;
    }

    /**
     * Set min height
     * @param {String} height - A string representing the height. E.g. 25px or 0.5em.
     */
    setMinHeight(height) {
      this.minHeight = height;
    }

    /**
     * Make window able to be dragged and resized.
     * @param {HTMLElement} elmnt - The window
     * @param {HTMLElement} header - The header
     * @param {HTMLElement} resizeElement - The element for resizing
     * @param {HTMLElement} close- The close button
     * @param {String} defaultHeight - The default height of the window
     * @param {String} defaultWidth - The default width of the window
     * @param {Boolean} keepAspectRatio - Whether or not to keep the original aspect ratio of the window when resizing 
     */
    configureElement(elmnt, header, resizeElement, close, defaultWidth, defaultHeight, keepAspectRatio=false) {
      var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      elmnt.style.width = defaultWidth+"em";
      elmnt.style.height = defaultHeight+"em";
      if (header) {
        // if present, the header is where you move the DIV from:
        header.onmousedown = dragMouseDown;
      } else {
        // otherwise, move the DIV from anywhere inside the DIV: 
        elmnt.onmousedown = dragMouseDown;
      }
      resizeElement.onmousedown = resize;
      function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        if(!e.target.classList.contains("no-move")) {
          // get the mouse cursor position at startup:
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          // call a function whenever the cursor moves:
          document.onmousemove = elementDrag;
        } else {
          if(e.target == close) {
            // close window
            elmnt.dispatchEvent(destroyEvent);
            elmnt.classList.remove("window-slow");
            elmnt.classList.add("window-fast");
            elmnt.style.opacity = "0";
            setTimeout(()=>{
              elmnt.remove();
            }, 150);
          }
        }
        
      }
      let fakeOffsetTop = elmnt.offsetTop;
      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // set the element's new position:
        elmnt.style.top = (fakeOffsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        if((fakeOffsetTop - pos2) < 0) {
          elmnt.style.top = "0px";
          fakeOffsetTop = fakeOffsetTop - pos2;
        } else {
          fakeOffsetTop = elmnt.offsetTop;
        }
      }

      function closeDragElement() {
        fakeOffsetTop = elmnt.offsetTop;
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
      }

      // not w3schools
      function resize(e) {
          e = e || window.event;
          e.preventDefault();
          document.onmouseup = closeDragElement
          document.onmousemove = resizeFunction;
      }
      var oldWidth = defaultWidth * em;
      var currentWidth = defaultWidth * em;
      var currentHeight = defaultHeight * em;
      var resizeFunction = function (e) {
          e = e || window.event;
          e.preventDefault();
          let msOffset = 8; // mouse offset so it is centered
          if((e.clientX - elmnt.offsetLeft)+msOffset > this.minWidth) {
            if(keepAspectRatio) {
              currentWidth = (e.clientX - elmnt.offsetLeft)+msOffset;
              elmnt.style.width = currentWidth + "px";
              currentHeight += currentWidth - oldWidth;
              elmnt.style.height = currentHeight + "px";
              oldWidth = currentWidth;
            } else {
              elmnt.style.width = (e.clientX - elmnt.offsetLeft)+msOffset + "px";
            }
          } else {
            elmnt.style.width = this.minWidth;
          }
          if((e.clientY - elmnt.offsetTop)+msOffset > this.minHeight) {
            if(!keepAspectRatio) {
              elmnt.style.height = (e.clientY - elmnt.offsetTop)+msOffset + "px";
            }
          } else {
            elmnt.style.height = this.minHeight;
          }
          elmnt.dispatchEvent(resizeEvent);
      }.bind(this);
    }
    /**
     * Returns the width of the window in pixels.
     */
    getWidth() {
      return this.window.clientWidth;
    }
    /**
     * Returns the height of the window in pixels.
     */
    getHeight() {
      return this.window.clientHeight;
    }
    /**
     * Returns the width of the window in em.
     */
    getWidthInEm() {
      return this.window.clientWidth/em;
    }
    /**
     * Returns the height of the window in em.
     */
    getHeightInEm() {
      return this.window.clientHeight/em;
    }
    /**
     * Forces the window to close.
     * @param {Boolean} fade - Default true. Whether or not to fade out when closing.
     */
    forceClose(fade=true) {
      this.window.dispatchEvent(destroyEvent);
      if(fade) {
        this.window.classList.remove("window-slow");
        this.window.classList.add("window-fast");
        this.window.style.opacity = "0";
        setTimeout(()=>{
          this.window.remove();
        }, 150);
      } else {
        setTimeout(()=>{ // allow for handling of event
          this.window.remove();
        }, 50);
      }
      
    }
}




// * /* EVENTS */

// Called on the window when the window gains focus
var focusEvent = new Event('window-focus');
// Called on the window when it gets resized
var resizeEvent = new Event('window-resize');
// Called on the window when it is closed
var destroyEvent = new Event('window-destroy');


// * /* GLOBAL WINDOW THINGS */
// Right Click Menu
class RightClickMenu {
  /**
   * Adds an element to the menu. IDs are recommended.
   * Example usage:
   * RightClickMenu.addToMenu("Menu Item", ".window"); // will only show up when a window has been right clicked
   * 
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
                      document.body.removeEventListener('pointerdown', removeOnClick, false);
                  }

                  document.body.addEventListener('pointerdown', removeOnClick, false);
              }
              // remove listener
              document.body.removeEventListener('pointerup', pointerHandle, false);
          }

          document.body.addEventListener('pointerup', pointerHandle, false);
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