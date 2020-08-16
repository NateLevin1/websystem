// This code runs for *all* dragging

// modified from https://developer.mozilla.org/en-US/docs/Web/API/Document/drag_event
var dragged;

document.addEventListener("dragstart", function(event) {
    // store a ref. on the dragged elem
    dragged = event.target;
    dragged.querySelector("img").classList.remove("folder-img");
    // make it half transparent
    event.target.style.opacity = "0.6";

    // set the correct image (includes all selections)
    let selected = mainContent.querySelectorAll(".icon-selected");
    selected = Array.from(selected);

    selected = selected.filter((element)=>{
        if(!element.draggable) {
            element.classList.remove("icon-selected");
        }
        return element.draggable;
    });


    if(selected && !(selected.length == 1 && selected[0] == dragged) && selected.includes(dragged)) { // add the multiple thing
        event.target.style.opacity = "1";
        let selDiv = document.createElement("div");
        selDiv.style.pointerEvents = "none";
        selDiv.style.paddingLeft = "4px";
        selDiv.style.paddingRight = "4px";
        selDiv.style.textAlign = "center";

        let multipleText = document.createElement("p");
        multipleText.textContent = "Multiple:";
        multipleText.classList.add("multiple-text");
        selDiv.appendChild(multipleText);
        selected.forEach((element)=>{
            let el = element.cloneNode(true);
            el.style.opacity = "1";
            el.style.margin = "0";
            el.style.minHeight = "3em";
            el.querySelector("img").remove();
            selDiv.appendChild(el);            
        });

        selDiv.style.display = "block";
        selDiv.style.position = "absolute";
        selDiv.style.top = "100px";
        selDiv.style.left = "100px";
        selDiv.style.zIndex = "48";
        selDiv.style.width = window.getComputedStyle(event.target).getPropertyValue("width");

        document.body.appendChild(selDiv);
        event.dataTransfer.setDragImage(selDiv, selDiv.style.width.substring(0, selDiv.style.width.length-2)/2-2, 2.5*em);


        setTimeout(()=>{
            selDiv.remove();
        }, 1);
    } else if(!selected.includes(dragged)) {
        // remove old selection if it isn't included
        selected.forEach((element)=>{
            element.classList.remove("icon-selected");
        });
    }
}, false);

document.addEventListener("dragend", function(event) {
    // reset the transparency
    event.target.style.opacity = "";
    dragged.querySelector("img").classList.add("folder-img");
}, false);

/* events fired on the drop targets */
document.addEventListener("dragover", function(event) {
    // prevent default to allow drop
    event.preventDefault();
}, false);

document.addEventListener("dragenter", function(event) {
    if (event.target.className.includes("folder-img")) {
        event.target.parentNode.classList.add("folder-move-in");
    } else if(event.target.className.includes("background-drop") && event.target.getAttribute("path") != dragged.getAttribute("path") && folders[dragged.getAttribute("path")].parent != event.target.getAttribute("path")) {
        event.target.classList.add("background-drop-move-in");
    }
}, false);

document.addEventListener("dragleave", function(event) {
    if (event.target.className.includes("folder-img")) {
        event.target.parentNode.classList.remove("folder-move-in");
    }  else if(event.target.className.includes("background-drop") && event.target.getAttribute("path") != dragged.getAttribute("path") && folders[dragged.getAttribute("path")].parent != event.target.getAttribute("path")) {
        event.target.classList.remove("background-drop-move-in");
    }
}, false);

document.addEventListener("drop", function(event) {
    try {
        // prevent default action (open as link for some elements)
        event.preventDefault();
        let draggedPath = dragged.getAttribute("path");
        
        // move dragged elem to the selected drop target
        if (event.target.className.includes("folder-img")) {
            // event.target == the element that the drag was ended on (the img in this case, so parentNode is needed)
            event.target.parentNode.classList.remove("folder-move-in");
            moveByDrop(event.target.parentNode, draggedPath, dragged);
        } else if(event.target.className.includes("background-drop") && event.target.getAttribute("path") != draggedPath && folders[draggedPath].parent != event.target.getAttribute("path")) {
            // event.target == the element that the drag was ended on
            event.target.classList.remove("background-drop-move-in");
            moveByDrop(event.target, draggedPath, dragged);
        }
    } catch(e) {
        console.error(e, "Dragged:",dragged, "draggedPath:"+dragged.getAttribute("path"), "Folders[draggedPath]", folders[dragged.getAttribute("path")]);
    }
}, false);