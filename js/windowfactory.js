class Window {
    constructor(width, height, title) {
        let window = document.createElement("div");
        window.classList.add("window", "absolute", "window-slow");

        let header = document.createElement("div");
        header.classList.add("window-header", "unselectable");

        let titleText = document.createElement("a");
        titleText.innerText = title;

        let close = document.createElement("div");
        close.classList.add("close", "unselectable");
        
        let resize = document.createElement("div");
        resize.classList.add("resize");

        // put it all together
        header.appendChild(titleText);
        header.appendChild(close);

        window.appendChild(header);
        window.appendChild(resize);
        document.body.appendChild(window);

        this.lastChildNoChildren = window.lastChild;

        setTimeout(()=>{
          window.style.opacity = "1";
        }, 10);
        

        configureElement(window, header, resize, close, 30, 30, 100, 100);

        this.window = window;
        this.window.header = header;
        this.window.titleText = titleText;
    }

    getWindow() {
        return this.window;
    }

    getHeader() {
      return this.window.header;
    }

    clear() {
      while(this.window.lastChild != this.lastChildNoChildren) {
        this.window.removeChild(this.window.lastChild);
      }
    }

    setTitle(newTitle) {
      this.window.titleText.innerText = newTitle;
    }

}
// from W3Schools
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
function configureElement(elmnt, header, resizeElement, close, defaultWidth, defaultHeight, minWidth=200, minHeight=200) {
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
      if(e.target != close) {
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
      } else {
        // close window
        elmnt.classList.remove("window-slow");
        elmnt.classList.add("window-fast");
        elmnt.style.opacity = "0";
        setTimeout(()=>{
          elmnt.remove();
        }, 150)
        
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
        document.onmouseup = closeDragElement;
        document.onmousemove = resizeMove;
    }

    function resizeMove(e) {
        e = e || window.event;
        e.preventDefault();
        let msOffset = 8; // mouse offset so it is centered
        if((e.clientX - elmnt.offsetLeft)+msOffset > minWidth) {
          elmnt.style.width = (e.clientX - elmnt.offsetLeft)+msOffset + "px";
        }
        if((e.clientY - elmnt.offsetTop)+msOffset > minHeight) {
          elmnt.style.height = (e.clientY - elmnt.offsetTop)+msOffset + "px";
        }
    }
  }