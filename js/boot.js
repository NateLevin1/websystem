/**
 * Begin Boot Sequence
 * Runs after page has been loaded.
 */
function boot() {
    // main box
    let dialogboxcontainer = document.createElement("div");
    dialogboxcontainer.classList.add("small-window");
    dialogboxcontainer.style.overflow = "auto";
    // centered container
    let dialogbox = document.createElement("div");
    dialogbox.classList.add("centered");
    // top text
    let header = document.createElement("a");
    header.innerText = "Login";
    header.classList.add("black", "bold", "big", "sans-serif", "unselectable");
    dialogbox.appendChild(header);

    // username text
    let username = document.createElement("h2");
    username.classList.add("black", "medium", "sans-serif", "regular", "unselectable");
    dialogbox.appendChild(username);

    // get/set name
    let name = localStorage.getItem("name");
    if(name) {
        username.innerText = "Welcome Back "+name+".";
        username.classList.add("centered");
    } else {
        username.innerText = "Welcome to WebSystem. Create a new account?";
        // create label
        let label = document.createElement("label");
        label.innerText = "Name: ";
        label.classList.add("black", "sans-serif", "normal", "fancy-input-label", "unselectable");
        dialogbox.appendChild(label);

        // create name input
        let newAccountName = document.createElement("input");
        newAccountName.classList.add("fancy-input");
        dialogbox.appendChild(newAccountName);

        // create create button
        let createButton = document.createElement("div");
        createButton.classList.add("form-button", "black", "sans-serif", "unselectable");
        createButton.innerHTML = "Create!";
        dialogbox.appendChild(createButton);

        // create onclick of create button
        createButton.onclick = ()=>{
            localStorage.setItem("name", newAccountName.value);
            //dialogboxcontainer.remove();
            fadeAndRemove(dialogboxcontainer);
        }
    }
    dialogboxcontainer.appendChild(dialogbox);
    document.body.appendChild(dialogboxcontainer);
}

function fadeAndRemove(element) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            element.remove();
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 10);
}