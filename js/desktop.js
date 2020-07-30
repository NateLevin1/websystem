document.onclick = (event)=>{
    // TODO Add support for background image
    if(event.target == document.querySelector(".main-content")) { 
        clearSelected();
    } // clicked anywhere
}
/**
 * Remove the 'icon-selected' class from all icons. Note that this will not deselect any icons in a file chooser GUI.
 */
function clearSelected() {
    let selected = document.querySelectorAll(".icon-selected");
    selected.forEach((node)=>{
        node.classList.remove("icon-selected");
    });
}