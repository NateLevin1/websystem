/**
 * Begin Boot Sequence
 * Runs after page has been loaded.
 */
function boot() {
    let name = localStorage.getItem("name");
    if(!name) {
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
            fadeAndRemove(dialogboxcontainer, true);
        }

        dialogboxcontainer.appendChild(dialogbox);
        document.body.appendChild(dialogboxcontainer);
    } else {
        // there is a name already, initiate desktop opening
        startDesktop();
    }
    
}

function fadeAndRemove(element, start=false) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            element.remove();
            if(start) {
                startDesktop();
            }
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 10);
}

function startDesktop() {
    // spinner/loader
    let spinner = document.createElement("div");
    spinner.classList.add("spinner");
    document.body.appendChild(spinner);

    // text container
    let welcomeTextContainer = document.createElement("div");
    welcomeTextContainer.classList.add("spinner-text");

    // actual text
    let welcomeText = document.createElement("h1");
    welcomeText.classList.add("white", "bold", "big", "sans-serif", "unselectable");
    welcomeText.innerText = "Welcome, "+localStorage.getItem("name")+".";
    welcomeTextContainer.appendChild(welcomeText);
    document.body.appendChild(welcomeTextContainer);

    /* SHOW DESKTOP */
    createFolder("1","1","Documents");
    createFolder("1","8","Applications");

    var folders = document.getElementsByClassName("desktop-folder");
    for(var elnum = 0; elnum < folders.length; elnum++) {
        let clickedOn = folders[elnum];
        clickedOn.onclick = (event)=>{
            var n = new FileViewer;
            n.openFolder(clickedOn.id);
            // alert("Folder "+clickedOn.id+" clicked!");
        };
    }
}

function createFolder(x, y, name) {
    let newFolderContainer = document.createElement("div");
    newFolderContainer.classList.add("absolute", "clickable", "icon-container", "desktop-folder");
    newFolderContainer.style.top = y+"em";
    newFolderContainer.style.left = x+"em";
    newFolderContainer.id = name;
    document.body.appendChild(newFolderContainer);

    // img
    let newFolder = document.createElement("img");
    newFolder.src = "assets/folder.png";
    newFolder.classList.add("icon");
    newFolderContainer.appendChild(newFolder);

    // text
    let text = document.createElement("a");
    text.classList.add("white", "sans-serif");
    text.innerText = name;
    newFolderContainer.appendChild(text);
}

class FileViewer {
    openFolder(open) {
        var win = new Window(100,100,open);
    }
}

class Window {
    constructor(width, height, title) {
        console.group("New Window Info for title "+title);
        console.log("Title of new window: "+title+".\nWidth of new window: "+width+".\nHeight of new window: "+height+".");
        console.groupEnd();
    }

}