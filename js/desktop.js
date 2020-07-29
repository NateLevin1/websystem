document.onclick = (event)=>{
    // TODO Add support for background image
    if(event.target == document.querySelector("html")) { 
        clearSelected();
    } // clicked anywhere

    
    // document.body.querySelectorAll(".context-menu").forEach((element)=>{
    //     //console.log("Removing element..");
    //     document.body.removeChild(element);
    // }); // TODO
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