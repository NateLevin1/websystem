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
            fadeAndRemove(dialogboxcontainer, true);
            // Set Name
            localStorage.setItem("name", newAccountName.value);
            // Set Filesystem
            localStorage.setItem('folders', '[usr]{Documents,Applications,Downloads} [Documents]{WebSystem} [Applications]{file::Calculator.app} [Downloads]{} [WebSystem]{file::logo.png}');
            localStorage.setItem('files', "[logo.png]{iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAEu2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgZXhpZjpQaXhlbFhEaW1lbnNpb249IjEyOCIKICAgZXhpZjpQaXhlbFlEaW1lbnNpb249IjEyOCIKICAgZXhpZjpDb2xvclNwYWNlPSIxIgogICB0aWZmOkltYWdlV2lkdGg9IjEyOCIKICAgdGlmZjpJbWFnZUxlbmd0aD0iMTI4IgogICB0aWZmOlJlc29sdXRpb25Vbml0PSIyIgogICB0aWZmOlhSZXNvbHV0aW9uPSI3Mi4wIgogICB0aWZmOllSZXNvbHV0aW9uPSI3Mi4wIgogICBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIgogICBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiCiAgIHhtcDpNb2RpZnlEYXRlPSIyMDIw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}")
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

    // load screen cover
    var openBG = document.createElement("div");
    openBG.classList.add("screen-cover", "loading", "load-fade", "unselectable");
    document.body.appendChild(openBG);
    // spinner/loader
    let spinner = document.createElement("div");
    spinner.classList.add("spinner", "loading", "load-fade", "unselectable");
    document.body.appendChild(spinner);

    // text container
    let welcomeTextContainer = document.createElement("div");
    welcomeTextContainer.classList.add("spinner-text", "loading", "load-fade", "unselectable");

    // actual text
    let welcomeText = document.createElement("h1");
    welcomeText.classList.add("white", "bold", "big", "sans-serif", "unselectable");
    welcomeText.innerText = "Welcome, "+localStorage.getItem("name")+".";
    welcomeTextContainer.appendChild(welcomeText);
    document.body.appendChild(welcomeTextContainer);

    /* FOLDER/FILE SYSTEM WORKERS */
    if(window.Worker) {
        // WORKER 1
        var folderSystem = new Worker('js/filesystem.js');
        folderSystem.postMessage("load");
        folderSystem.postMessage(localStorage.getItem("folders"));
        //localStorage.setItem("files", "[usr]{Documents,Applications} [Documents]{School Work} [Applications]{}");
        folderSystem.onmessage = (event) => {
            let data = event.data;
            var yPos = 1;
            data.forEach(element => {
                // get what is on desktop
                if(element.name == "usr") {
                    element.subFolders.forEach(el =>{
                        createDesktopFolder("1",yPos.toString(), el);
                yPos += 8;
                    });
                    
                }
                folders[element.name] = element.subFolders;
                folders["parent-"+element.name] = element.parentFolder;
            });
        }



        // WORKER 2
        var filesystem = new Worker('js/filedata.js');
        filesystem.postMessage(localStorage.getItem("files"));
        filesystem.onmessage = (event) => { // object passed back is structured as {name:"", data:""}
            let data = event.data;
            files[data.name] = data.data;
            // Structured as follows.
            // {
            //     name: {data},
            //     name2: {data2}
            // }
        }
    } else { // pseudo polyfill for browsers that don't support webworkers
        var system = document.createElement("script");
        system.src = "js/filesystem.js";
        var data = document.createElement("script");
        data.src = "js/filedata.js";

        // run the scripts
        document.body.appendChild(system);
        document.body.appendChild(data);
    }

    setTimeout(()=>{
        let faders = document.querySelectorAll(".load-fade");
        faders.forEach(element =>{
            element.classList.remove("load-fade");
            setTimeout(()=>{
                element.remove();
            }, 300);
        });
    }, 500)
    
}

var folders = {};
var files = {};

// * Debug
//localStorage.clear();
// [usr]{Documents,Applications} [Documents]{School Work, Other Stuff} [Applications]{} [School Work]{} [Other Stuff]{}
//console.log(localStorage.getItem('files'));
//localStorage('files', localStorage.getItem('files');
// localStorage.getItem('files')