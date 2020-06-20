document.onclick = (event)=>{
    // TODO Add support for background image
    if(event.target == document.querySelector("html")) { 
        clearSelected();
    } // clicked anywhere
}

function clearSelected() {
    let selected = document.querySelectorAll(".icon-selected");
    selected.forEach((node)=>{
        node.classList.remove("icon-selected");
    });
}