class Window {
    constructor(width, height, title) {
        console.group("New Window Info for title "+title);
        console.log("Title of new window: "+title+".\nWidth of new window: "+width+".\nHeight of new window: "+height+".");
        console.groupEnd();
        
        let wind = document.createElement("div");
        let header = document.createElement("div");
        let r = document.createElement("div");
    }

}
dragElement(document.getElementById("window"), document.getElementById("windowheader"), document.getElementById("windowresize"));
// from W3Schools
/**
 * Make window able to be dragged and resized.
 * @param {Window} elmnt 
 * @param {Header} header 
 * @param {Resizer} resizeElement 
 * @param {Minimum width of window} minWidth 
 * @param {Minimum Height of window} minHeight 
 */
function dragElement(elmnt, header, resizeElement, minWidth=200, minHeight=200) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
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
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
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