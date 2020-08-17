class Window {
    /**
     * Constructor. Make a new window
     * @param {Number} minWidth - The minimum width in pixels.
     * @param {Number} minHeight - The minimum height in pixels.
     * @param {String} title - The title of the window
     * @param {Number} [defaultWidth=30] - The default width of the window in em.
     * @param {Number} [defaultHeight=30] - The default width of the window in em.
     * @param {Object} [options={ x: 3, y: 3, keepAspectRatio: false }] - The options object
     * @param {Number} options.x - The default x position on the screen.
     * @param {Number} options.y The default y position on the screen.
     * @param {Boolean} options.keepAspectRatio - If true, keeps the aspect ratio when resizing.
     * @param {Function} options.topBarCreator - The function to be called when a top bar is requested
     * @param {class} options.thisContext - The 'this' context for any callbacks run in the window.
     * @param {Boolean} options.resizeDisabled - Whether or not to disable resizing on the window
     * @param {Boolean} options.zIndexDisabled - Whether or not to adjust z indexes on click etc. Useful for popups.
     */
    constructor(minWidth, minHeight, title, defaultWidth=30, defaultHeight=30, options={ x: 3, y: 3, keepAspectRatio: false, topBarCreator: ()=>{}, thisContext: this, resizeDisabled: false, zIndexDisabled: false, appName:"" }) {
      // Take options into account
      let {x, y, keepAspectRatio, topBarCreator, thisContext, resizeDisabled, zIndexDisabled, appName } = options;
      if(!topBarCreator) { // use default 'file -> quit'
        topBarCreator = ()=>{
          TopBar.addToTop("File", "file");
          TopBar.addToMenu("Close Window", "file", ()=>{ this.close(); });
        }
      }
      this.topBarCreator = topBarCreator;
      this.thisContext = thisContext;
      this.title = title;
      this.appName = appName;
      
      let window = document.createElement("div");
      window.classList.add("window", "absolute", "window-slow");
      window.style.top = y+"em";
      window.style.left = x+"em";

      let header = document.createElement("div");
      header.classList.add("window-header", "unselectable");

      let titleText = document.createElement("a");
      titleText.innerText = title;
      
      let close = document.createElement("div");
      close.classList.add("close", "unselectable", "no-move", "no-focus");
      
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
      
      this.minWidth = minWidth;
      this.minHeight = minHeight;
      this.configureElement(window, header, resize, close, defaultWidth, defaultHeight, keepAspectRatio);

      this.window = window;
      this.window.header = header;
      this.window.titleText = titleText;

      if(resizeDisabled) {
        this.disableResize();
      }
      if(zIndexDisabled) {
        this.disableZIndex();
      } else {
        this.useZIndexes = true;
      }

      // Focus/Unfocus
      this.dispatchFocus(); // when new window is opened focus by default

      this.window.onmousedown = (event)=>{
        if(!event.target.classList.contains("no-focus")) {
          this.dispatchFocus();
        }
      }

      const windowFocusHandler = (event)=>{
        if(this.isClosed()) {
          document.removeEventListener("window-focus", windowFocusHandler);
        }
        if(event.window == this.window) {
          this.giveFocus();
        } else {
          this.removeFocus();
        }
      }
      document.addEventListener('window-focus', windowFocusHandler);

      this.window.addEventListener('window-destroy', (event)=>{
        setTimeout(()=>{
          if(!event.preventClose) {
            if(parseInt(this.window.style.zIndex) >= 39) { // prevents closing background windows from taking focus
              // reset topbar
              TopBar.clear();
              // give focus to next most focused
              let windows = document.querySelectorAll(".window");
              windows = Array.from(windows);
              if(windows.length == 1 && windows[0] == this.window) { // desktop
                focusEvent.window = "DESKTOP";
                document.dispatchEvent(focusEvent);
              } else {
                let zIndices = windows.map((element)=>{
                  return element == this.window ? 0 : parseInt(element.style.zIndex); // don't include in search if it is the element
                });
                let element = windows[zIndices.indexOf(Math.max(...zIndices))] // find window with highest z index
                focusEvent.window = element;
                document.dispatchEvent(focusEvent);
              }
            }
          }
        }, 51);
        
      });
    }
    /**
     * Get the window. Note that the window includes the header, so setting overflow: auto on this may look wrong.
     * @returns {HTMLElement} The window element
     */
    getWindow() {
      return this.window;
    }
    /**
     * Get the header element.
     * @returns {HTMLElement} The header element
     */
    getHeader() {
      return this.window.header;
    }
    /**
     * Get the title of the window
     * @returns {HTMLElement} The header text element
     */
    getHeaderText() {
      return this.window.titleText;
    }

    disableResize() {
      this.window.querySelector(".resize").remove();
      let noResize = document.createElement("div");
      noResize.classList.add("resize", "no");
      this.window.appendChild(noResize);
    }

    disableZIndex() {
      this.useZIndexes = false;
    }

    /**
     * Get the window's width. Note that the returned value is a string.
     * Use <code>getWidth</code> to get it as an integer in px, or <code>getWidthInEm</code> to get it as an integer in em.
     * @returns {String} A string, ending in px or em.
     */
    getWindowWidth() {
      return this.window.style.width;
    }
    /**
     * Get the window's height. Note that the returned value is a string.
     * Use <code>getHeight</code> to get it as an integer in px, or <code>getHeightInEm</code> to get it as an integer in em.
     * @returns {String} A string, ending in px or em.
     */
    getWindowHeight() {
      return this.window.style.height;
    }
    /**
     * Clear the window. Removes all elements that are children of the window (except the header).
     */
    clear() {
      while(this.window.lastChild != this.lastChildNoChildren) {
        this.window.removeChild(this.window.lastChild);
      }
    }
    /**
     * Set the title of the window.
     * @param {String} newTitle - The title of the window.
     */
    setTitle(newTitle) {
      this.title = newTitle;
      this.window.titleText.innerText = newTitle;
      if(!this.appName) { // if the app doesn't have a custom app name (this is arbitrary because if they want to change it and have an app name they can call the function themselves)
        this.updateTopBarName();
      }
    }
    
    /**
     * Set the background color of the window.
     * @param {String} color - the color to be used. e.g. 'rgb(10,10,10)' or 'red'
     */
    setBackgroundColor(color) {
      this.window.style.backgroundColor = color;
    }

    /**
     * Set the background color of the header.
     * @param {String} color - the color to be used. e.g. 'rgb(10,10,10)' or 'red'
     */
    setHeaderColor(color) {
      this.window.header.style.backgroundColor = color;
    }
    /**
     * Set the text color of the header.
     * @param {String} color - the color to be used. e.g. 'rgb(10,10,10)' or 'red'
     */
    setHeaderTextColor(color) {
      this.window.header.style.color = color;
    }

    /**
     * Makes a string for the window. Useful for needing a key for an object which is the window, i.e. when creating right click menus.
     */
    makeString() {
      this.uniqueId = "window-"+Math.random();
      return this.uniqueId;
    }

    /**
     * @returns {Boolean} Whether or not the window has focus.
     */
    focused() {
      return this.hasFocus;
    }
    /**
     * Used internally, should *not* be used to give a window focus. Use dispatchFocus() for that.
     */
    giveFocus() {
      this.hasFocus = true;
      if(this.useZIndexes) {
        this.window.style.zIndex = 40;
      }
      // correct topbar
      TopBar.clear();
      if(this.topBarCreator) {
        if(this.appName) { // if has name, show it
          // show name
          TopBar.addName(this.appName);
        } else {
          TopBar.addName(this.title);
        }
        
        // actually create it
        this.topBarCreator.bind(this.thisContext)();
      }
    }

    updateTopBarName(newName=this.title) {
      TopBar.updateName(newName);
    }
    /**
     * Remove the focus from the window. Used internally, may be annoying to user if this is run.
     */
    removeFocus() {
      this.hasFocus = false;
      if(this.useZIndexes) {
        if(this.window.style.zIndex > 2) {
          this.window.style.zIndex -= 1;
        }
      }
    }
    /**
     * Give the current window focus. Used internally, may be annoying to user if this is run.
     */
    dispatchFocus() {
      if(!this.hasFocus) {
        this.giveFocus(); // give opened window focus
        focusEvent.window = this.window;
        document.dispatchEvent(focusEvent);
      }
    }

    setTopBarCreator(func) {
      this.topBarCreator = func;
    }

    /**
     * Set the minimum width of the element
     * @param {String} width - A string representing the width. E.g. 25px or 0.5em.
     */
    setMinWidth(width) {
      this.minWidth = width;
    }

    /**
     * Set the minimum height of the element
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
      
      var dragMouseDown = (e)=>{
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
            this.close();
          }
        }
      }

      // Set the stuff
      if (header) {
        // if present, the header is where you move the DIV from:
        header.onmousedown = dragMouseDown;
      } else {
        // otherwise, move the DIV from anywhere inside the DIV: 
        elmnt.onmousedown = dragMouseDown;
      }
      resizeElement.onmousedown = resize;

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
          document.onmouseup = closeDragElement;
          document.onmousemove = resizeFunction;
      }
      var oldWidth = defaultWidth * em;
      var currentWidth = defaultWidth * em;
      var currentHeight = defaultHeight * em;
      var resizeFunction = (e)=>{
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
          if((e.clientY - elmnt.offsetTop)+msOffset - 1.7*em > this.minHeight) { // the 1.7em is to offset the topbar
            if(!keepAspectRatio) {
              elmnt.style.height = (e.clientY - elmnt.offsetTop)+msOffset - 1.7*em + "px";
            }
          } else {
            elmnt.style.height = this.minHeight;
          }
          elmnt.dispatchEvent(resizeEvent);
      }
    }
    /**
     * @returns {Number} The width in pixels.
     */
    getWidth() {
      return this.window.clientWidth;
    }
    /**
     * @returns {Number} The height in pixels.
     */
    getHeight() {
      return this.window.clientHeight;
    }
    /**
     * @returns {Number} The width of the window in em.
     */
    getWidthInEm() {
      return this.window.clientWidth/em;
    }
    /**
     * @returns {Number} The height of the window in em.
     */
    getHeightInEm() {
      return this.window.clientHeight/em;
    }
    /**
     * Tells the window to close. If the <code>preventClose</code> attribute of 
     * the event is <code>true</code>, then it will not close and it will display
     * the event's <code>message</code> property (if it exists).
     * 
     * @param {Boolean} [fade=true] - Whether or not to fade out when closing.
     */
    close(fade=true) {
      this.window.addEventListener("window-destroy", (event)=>{
        setTimeout(()=>{
          if(event.preventClose) {
            var close;
            if(event.message) {
              // show the custom popup
              confirm(event.message).then((result)=>{
                close = result;
                if(close) { // if user says yes
                  this.forceClose(fade);
                }
              });
            } else {
              // show a generic popup
              close = confirm("Are you sure you want to close this application?").then((result)=>{
                close = result;
                if(close) { // if user says yes
                  this.forceClose(fade);
                }
              });
            }
          } else {
            this.forceClose(fade);
          }

          // reset vars
          event.preventClose = false;
          event.message = "";
        }, 50);
      }, { once: true });

      this.window.dispatchEvent(destroyEvent);
    }


    /**
     * Force the window to close. Note that this <strong>will not</strong> send a <code>'window-destroy'</code> event,
     * and the window will be destroyed without checking if it should be (e.g. checking if work has been saved)
     * If sending a <code>'window-destroy'</code> event is wanted, use the <code>close()</code> method instead.
     * 
     * @param {Boolean} [fade=true] - Whether or not to fade out when closing the window
     */
    forceClose(fade=true) {
      this.closed = true;
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

    isClosed() {
      return this.closed;
    }
}

var preventCloseWindowReason = "";




// * /* EVENTS */

// Called on the window when the window gains focus
var focusEvent = new Event('window-focus');
// Called on the window when it gets resized
var resizeEvent = new Event('window-resize');
// Called on the window when it is closed
var destroyEvent = new Event('window-destroy');