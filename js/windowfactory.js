class Window {
    /**
     * Constructor
     * @param {Minimum Width (px)} width 
     * @param {Minimum Height (px)} height 
     * @param {Title of window} title 
     * @param {Default Width (em)} defaultWidth 
     * @param {Default Height (em)} defaultHeight 
     * @param {Default X Position} x 
     * @param {Default Y Position} y 
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

        // let back = document.createElement("div");
        // back.classList.add("file-back-container", "unselectable", "no-move");

        // let backImg = document.createElement("img");
        // backImg.classList.add("file-back");
        // backImg.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTMuMDI1IDFsLTIuODQ3IDIuODI4IDYuMTc2IDYuMTc2aC0xNi4zNTR2My45OTJoMTYuMzU0bC02LjE3NiA2LjE3NiAyLjg0NyAyLjgyOCAxMC45NzUtMTF6Ii8+PC9zdmc+";
        


        let close = document.createElement("div");
        close.classList.add("close", "unselectable", "no-move");
        
        let resize = document.createElement("div");
        resize.classList.add("resize");

        // put it all together
        // back.appendChild(backImg);
        // header.appendChild(back);

        header.appendChild(titleText);
        header.appendChild(close);

        window.appendChild(header);
        window.appendChild(resize);
        document.body.appendChild(window);

        this.lastChildNoChildren = window.lastChild;

        setTimeout(()=>{
          window.style.opacity = "1";
        }, 10);
        

        this.configureElement(window, header, resize, close, defaultWidth, defaultHeight, width, height, keepAspectRatio);

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

    setBackgroundColor(color) {
      this.window.style.backgroundColor = color;
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
     * Make window able to be dragged and resized.
     * @param {Window} elmnt 
     * @param {Header} header 
     * @param {Resizer} resizeElement 
     * @param {Close button} close
     * @param {Default width of window} defaultHeight 
     * @param {Default height of window} defaultWidth 
     * @param {Minimum width of window} minWidth 
     * @param {Minimum Height of window} minHeight 
     */
    configureElement(elmnt, header, resizeElement, close, defaultWidth, defaultHeight, minWidth=200, minHeight=200, keepAspectRatio=false) {
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
            elmnt.classList.remove("window-slow");
            elmnt.classList.add("window-fast");
            elmnt.style.opacity = "0";
            setTimeout(()=>{
              elmnt.remove();
            }, 150);
          }
        }
        
      }

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
      }

      function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
      }

      // not w3schools
      function resize(e) {
          e = e || window.event;
          e.preventDefault();
          document.onmouseup = closeDragElement
          document.onmousemove = resizeMove;
      }
      var oldWidth = defaultWidth * em;
      var currentWidth = defaultWidth * em;
      var currentHeight = defaultHeight * em;
      function resizeMove(e) {
          e = e || window.event;
          e.preventDefault();
          let msOffset = 8; // mouse offset so it is centered
          if((e.clientX - elmnt.offsetLeft)+msOffset > minWidth) {
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
            elmnt.style.width = minWidth;
          }
          if((e.clientY - elmnt.offsetTop)+msOffset > minHeight) {
            if(!keepAspectRatio) {
              elmnt.style.height = (e.clientY - elmnt.offsetTop)+msOffset + "px";
            }
          } else {
            elmnt.style.height = minHeight;
          }
          elmnt.dispatchEvent(resizeEvent);
      }
}

}




// * /* EVENTS */

// Called on the window when the window gains focus
var focusEvent = new Event('window-focus');
// Called on the window when it gets resized
var resizeEvent = new Event('window-resize');


// * /* GLOBAL WINDOW THINGS */
// Right Click Menu
var rightClickMenu = document.createElement("div");
rightClickMenu.classList.add("right-click", "right-click-fast", "unselectable", "absolute");
document.body.appendChild(rightClickMenu);