class Window {
    /**
     * Constructor. Make a new window
     * @param {Number} minWidth - The minimum width in pixels.
     * @param {Number} minHeight - The minimum height in pixels.
     * @param {String} title - The title of the window
     * @param {Number} [defaultWidth=30] - The default width of the window in em.
     * @param {Number} [defaultHeight=30] - The default width of the window in em.
     * @param {Object} [options={ x: 3, y: 3, topBarCreator: ()=>{}, thisContext: this, resizeDisabled: false, zIndexDisabled: false, appName:"", pathToApp:"" }] - The options object
     * @param {Number} options.x - The default x position on the screen in vw.
     * @param {Number} options.y The default y position on the screen in vh.
     * @param {Function} options.topBarCreator - The function to be called when a top bar is requested
     * @param {class} options.thisContext - The 'this' context for any callbacks run in the window.
     * @param {Boolean} options.resizeDisabled - Whether or not to disable resizing on the window
     * @param {Boolean} options.zIndexDisabled - Whether or not to adjust z indexes on click etc. Useful for popups.
     * @param {Boolean} options.maximizeDisabled - Whether or not to to allow maximization of the app.
     * @param {String} options.pathToApp - The path to the app that is being opened. Used in the dock.
     */
    constructor(minWidth, minHeight, title, defaultWidth=30, defaultHeight=30, options={ x: 3, y: 3, topBarCreator: ()=>{}, thisContext: this, resizeDisabled: false, zIndexDisabled: false, maximizeDisabled: false, appName:"", pathToApp:"" }) {
      // Take options into account
      let {x, y, topBarCreator, thisContext, resizeDisabled, zIndexDisabled, maximizeDisabled, appName, pathToApp} = options;
      x = x ? x : 3;
      y = y ? y : 3;

      // if there was a coord, use it
      if(pathToApp) {
        let windows = Array.from(mainContent.querySelectorAll(".window")).filter((node)=>{ return node.getAttribute("pathToApp") == pathToApp; });
        if(windows.length > 0) { // only do this if there are already open windows of this kind
          if(lastCoordinateOfApp[pathToApp]) {
            let pos = lastCoordinateOfApp[pathToApp];
            x = pos.x+1;
            y = pos.y+1;
          }
          lastCoordinateOfApp[pathToApp] = {x: x, y: y};
        } else {
          lastCoordinateOfApp[pathToApp] = {x: x, y: y};
        }
      }
      

      if(!topBarCreator) { // use default 'file -> close window'
        topBarCreator = ()=>{
          TopBar.addToTop("File", "file");
          TopBar.addToMenu("Close Window", "file", ()=>{ this.close(); });
        }
      }
      this.topBarCreator = topBarCreator;
      this.thisContext = thisContext;
      this.title = title;
      appName = !appName && pathToApp ? folders[pathToApp].name : appName;
      this.appName = appName;
      this.pathToApp = pathToApp;

      this.defaultX = x;
      this.defaultY = y;
      
      let window = document.createElement("div");
      window.classList.add("window", "absolute", "window-slow");
      window.style.top = y+"vh";
      window.style.left = x+"vw";
      window.setAttribute("pathToApp", pathToApp);

      let header = document.createElement("div");
      header.classList.add("window-header", "unselectable");

      let titleText = document.createElement("div");
      titleText.classList.add("window-title");
      titleText.innerText = title;
      
      let close = document.createElement("div");
      close.classList.add("close", "unselectable", "no-move", "no-focus", "window-action");
      close.onclick = ()=>{
        this.close();
      }
      
      header.appendChild(titleText);
      if(!resizeDisabled) {
        // note that the icon is still shown on maximize disabled, it is just grayed out
        let maximize = document.createElement("div");
        maximize.classList.add(maximizeDisabled ? "maximize-disabled" : "maximize", "unselectable", "no-move", "no-focus", "window-action");
        if(!maximizeDisabled) {
          maximize.onclick = ()=>{
            this.dispatchFocus();
            this.window.style.left = "0.2em";
            this.window.style.top = "0.2em";
            this.window.style.width = "calc(100vw - 0.6em)";
            this.window.style.height = "calc(100% - 0.7em)";
            this.window.dispatchEvent(resizeEvent);
            this.fakeOffsetTop = this.window.offsetTop; // updates for moving
          }
        }
        header.appendChild(maximize);
      }
      if(pathToApp) { // the only way to open a minimized app is to click on it on dock. Apps without app path cannot be on dock
        let minimize = document.createElement("div");
        minimize.classList.add("minimize", "unselectable", "no-move", "no-focus", "window-action");
        minimize.onclick = ()=>{
          this.window.style.opacity = "0";
          this.window.style.transform = "scaleX(0.1) translateY(100vh)";
          this.window.classList.remove("window"); // prevents from being focused
          this.minimized = true;
          this.hasFocus = false;
          focusNewWindow();
        }
        header.appendChild(minimize);
      }
      header.appendChild(close);

      window.appendChild(header);
      let resizerArr = ["resize-bottom-right", "resize-bottom-left", "resize-top-right", "resize-top-left", "resize-left", "resize-right", "resize-top", "resize-bottom"];
      resizerArr.forEach((newClass)=>{
        let resize = document.createElement("div");
        resize.classList.add("resize", newClass);
        window.appendChild(resize);
      });

      mainContent.appendChild(window);

      this.lastChildNoChildren = window.lastChild;

      setTimeout(()=>{
        window.style.opacity = "1";
      }, 10);
      
      this.minWidth = minWidth;
      this.minHeight = minHeight;
      this.configureElement(window, header, defaultWidth, defaultHeight);

      this.window = window;
      this.header = header;
      this.titleText = titleText;

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
        if(this.window === undefined) {
          document.removeEventListener("window-focus", windowFocusHandler);
        }
        if(event.window == this.window) {
          this.giveFocus();
        } else {
          this.removeFocus();
        }
      }
      document.addEventListener('window-focus', windowFocusHandler);
      const focusNewWindow = ()=>{
        // reset topbar
        TopBar.clear();
        // give focus to next most focused
        let windows = document.querySelectorAll(".window");
        windows = Array.from(windows);
        if(windows.length == 0 || (windows.length == 1 && windows[0] == this.window)) { // desktop
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

      this.window.addEventListener('window-destroy', (event)=>{
        setTimeout(()=>{
          if(!event.preventClose) {
            if(parseInt(this.window.style.zIndex) >= 39) { // prevents closing background windows from taking focus
              focusNewWindow();
            }
          }
        }, 4);
      }, {once: true});

      // if the app doesn't have a dock right click menu, use the default. Note that this is only run once
      dock.addDefaults(appName, pathToApp);

      windowOpenChangeEvent.actions = {type: "open", affectedAppsPath: pathToApp, originWindow: this}
      document.dispatchEvent(windowOpenChangeEvent);
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
      return this.header;
    }
    /**
     * Get the title of the window
     * @returns {HTMLElement} The header text element
     */
    getHeaderText() {
      return this.titleText;
    }

    disableResize() {
      this.window.querySelectorAll(".resize").forEach((node)=>{
        let noResize = node.cloneNode();
        noResize.classList.add("no");
        this.window.appendChild(noResize);
        node.remove();
      });
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
      this.titleText.textContent = newTitle;
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
      this.header.style.backgroundColor = color;
    }
    /**
     * Set the text color of the header.
     * @param {String} color - the color to be used. e.g. 'rgb(10,10,10)' or 'red'
     */
    setHeaderTextColor(color) {
      this.header.style.color = color;
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
      if(this.minimized) { // minimize
        this.minimized = false;
        this.window.classList.add("window");
        this.window.style.transform = "";
        this.window.style.opacity = "1";
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
     * @param {String} defaultHeight - The default height of the window
     * @param {String} defaultWidth - The default width of the window
     */
    configureElement(elmnt, header, defaultWidth, defaultHeight) {
      var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

      while((defaultWidth * em) + 2 * (this.defaultX * window.innerWidth/100) > mainContent.clientWidth && (defaultWidth - 0.1) * em > this.minWidth) { // "2 *" for equal spacing
        defaultWidth -= 0.1;
        elmnt.dispatchEvent(resizeEvent);
      }
      while((defaultHeight * em) + 2 * (this.defaultY * window.innerHeight/100) > mainContent.clientHeight && (defaultHeight - 0.1) * em > this.minHeight) { // "2 *" for equal spacing
        defaultHeight -= 0.1;
        elmnt.dispatchEvent(resizeEvent);
      }
      elmnt.style.width = defaultWidth+"em";
      elmnt.style.height = defaultHeight+"em";

      let resizers = Array.from(elmnt.querySelectorAll(".resize"));
      
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
      resizers.forEach((resizeElement)=>{
        if(resizeElement.classList.contains("resize-bottom-left")) {
          resizeElement.onmousedown = (e)=>{resize(e, doResizeBL)};
        } else if(resizeElement.classList.contains("resize-bottom-right")) {
          resizeElement.onmousedown = (e)=>{resize(e, doResize)};
        } else if(resizeElement.classList.contains("resize-top-left")) {
          resizeElement.onmousedown = (e)=>{resize(e, doResizeTL)};
        } else if(resizeElement.classList.contains("resize-top-right")) {
          resizeElement.onmousedown = (e)=>{resize(e, doResizeTR)};
        } else if(resizeElement.classList.contains("resize-left")) {
          resizeElement.onmousedown = (e)=>{resize(e, doResizeL)};
        } else if(resizeElement.classList.contains("resize-right")) {
          resizeElement.onmousedown = (e)=>{resize(e, doResizeR)};
        } else if(resizeElement.classList.contains("resize-top")) {
          resizeElement.onmousedown = (e)=>{resize(e, doResizeT)};
        } else if(resizeElement.classList.contains("resize-bottom")) {
          resizeElement.onmousedown = (e)=>{resize(e, doResizeB)};
        }
      });

      this.fakeOffsetTop = elmnt.offsetTop;
      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        if((this.fakeOffsetTop - pos2) < 0) {
          elmnt.style.top = "0px";
          this.fakeOffsetTop = this.fakeOffsetTop - pos2;
        } else {
          this.fakeOffsetTop = elmnt.offsetTop;
        }
      }

      function closeDragElement(e) {
        this.fakeOffsetTop = elmnt.offsetTop;
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
      }
      const closeResizeElement = (e)=>{
        this.fakeOffsetTop = elmnt.offsetTop;
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;

        if(performanceModeEnabled) {
          // make the changes now
          elmnt.style.left = fakeEl.style.left;
          elmnt.style.top = fakeEl.style.top;
          elmnt.style.width = fakeEl.style.width;
          elmnt.style.height = fakeEl.style.height;
          elmnt.dispatchEvent(resizeEvent);
          mainContent.removeChild(fakeEl);
        }
        oldLeft = 0;
        oldWidth = 0;
        oldHeight = 0;
        oldTop = 0;
        x = 0;
        y = 0;
      }

      // not w3schools
      function resize(e, doFunc) {
          e = e || window.event;
          e.preventDefault();
          document.onmouseup = closeResizeElement;
          document.onmousemove = (e)=>{resizeFunction(e, doFunc)};
          oldLeft = e.x;
          oldWidth = elmnt.clientWidth;
          oldTop = e.y;
          oldHeight = elmnt.clientHeight;
          if(performanceModeEnabled) {
            fakeEl.style.zIndex = elmnt.style.zIndex;
            fakeEl.style.left = elmnt.offsetLeft + "px";
            fakeEl.style.top = elmnt.style.top;
            mainContent.appendChild(fakeEl);
          }
        }
      const msOffset = 0; // mouse offset so it is centered
      let fakeEl = elmnt.cloneNode();
      fakeEl.innerHTML = "";
      fakeEl.style.backgroundColor = "rgba(0,0,0,0.1)";
      fakeEl.style.opacity = "1";
      let oldLeft = 0;
      let oldWidth = 0;
      let oldHeight = 0;
      let oldTop = 0;
      let x = 0;
      let y = 0;
      const resizeFunction = (e, func)=>{
        e = e || window.event;
        e.preventDefault();
        x = e.clientX;
        y = e.clientY;
        if(!performanceModeEnabled) {
          func(elmnt);
          elmnt.dispatchEvent(resizeEvent);
        } else {
          func(fakeEl);
        }
      }
      const doResize = (el)=>{
        rightXResize(x, el)
        bottomYResize(y, el);
      }
      const doResizeBL = (el)=>{
        leftXResize(x, el);
        bottomYResize(y, el);
      }
      const doResizeTL = (el)=>{
        let newY = y - 1.7*em;
        leftXResize(x, el);
        topYResize(newY, el);
      }
      const doResizeTR = (el)=>{
        let newY = y - 1.7*em;
        rightXResize(x, el);
        topYResize(newY, el);
      }
      const doResizeL = (el)=>{
        leftXResize(x, el);
      }
      const doResizeR = (el)=>{
        rightXResize(x, el);
      }
      const doResizeT = (el)=>{
        let newY = y - 1.7*em;
        topYResize(newY, el);
      }
      const doResizeB = (el)=>{
        bottomYResize(y, el);
      }

      const leftXResize = (x, el)=>{
        if(x > 0) {
          if(oldWidth - (x - oldLeft) > this.minWidth) {
            el.style.width = oldWidth - (x - oldLeft) + "px";
            el.style.left = x + "px";
          } else {
            el.style.width = this.minWidth+"px";
          }
        }
      }
      const rightXResize = (x, el)=>{
        if(x < window.innerWidth - 2) {
          if((x - el.offsetLeft)+msOffset > this.minWidth) {
            el.style.width = (x - el.offsetLeft)+msOffset + "px";
          } else {
            el.style.width = this.minWidth+"px";
          }
        }
      }
      const topYResize = (y, el)=>{
        if(y > 0) {
          if(oldHeight - (y - (oldTop - 1.7*em)) > this.minHeight) { // the 1.7em is to offset the topbar
            el.style.height = oldHeight - (y - (oldTop - 1.7*em))+ "px";
            el.style.top = y + "px";
          } else {
            el.style.height = this.minHeight+"px";
          }
        }
      }
      const bottomYResize = (y, el)=>{
        if(y < window.innerHeight - 4.2*em) {
          if((y - el.offsetTop)+msOffset - 1.7*em > this.minHeight) { // the 1.7em is to offset the topbar
            el.style.height = (y - el.offsetTop)+msOffset - 1.7*em + "px";
          } else {
            el.style.height = this.minHeight+"px";
          }
        }
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
        }, 5);
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
      // dispatch dock close event
      windowOpenChangeEvent.actions = {type: "close", affectedAppsPath: this.pathToApp, originWindow: this}
      document.dispatchEvent(windowOpenChangeEvent);
      if(fade) {
        this.window.classList.remove("window-slow");
        this.window.classList.add("window-fast");
        this.window.style.opacity = "0";
        setTimeout(()=>{
          this.window.remove();
          this._deleteAllReferences();
        }, 150);
      } else {
        this.window.remove();
        this._deleteAllReferences();
      }
    }

    _deleteAllReferences() {
      setTimeout(()=>{
        // wait for dom updates before continuing
        // delete all properties of this for gc (https://stackoverflow.com/a/19316873/)
        if(this.thisContext) {
          // if we have a reference to the app's this context, delete it too
          Object.keys(this.thisContext).forEach((key)=>{ delete this.thisContext[key]; });
          delete this.thisContext;
        }
        Object.keys(this).forEach((key)=>{ delete this[key]; });
        delete this;
      }, 10);
    }
}

var preventCloseWindowReason = "";
let lastCoordinateOfApp = {};




// * /* EVENTS */

// Called on the window when the window gains focus
var focusEvent = new Event('window-focus');
// Called on the window when it gets resized
var resizeEvent = new Event('window-resize');
// Called on the window when it is closed
var destroyEvent = new Event('window-destroy');
// Called on document whenever a window is created and destroyed
var windowOpenChangeEvent = new Event("window-open-change");