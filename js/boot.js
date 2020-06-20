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
            localStorage.setItem('files', '[usr]{Documents,Applications,Downloads} [Documents]{WebSystem} [Applications]{file::Calculator.app} [Downloads]{} [WebSystem]{file::logo.png}');
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

    /* FILE SYSTEM WORKER */
    if(window.Worker) {
        var filesystem = new Worker('js/filesystem.js');

        filesystem.postMessage("load");
        filesystem.postMessage(localStorage.getItem("files"));
        //localStorage.setItem("files", "[usr]{Documents,Applications} [Documents]{School Work} [Applications]{}");
        filesystem.onmessage = (event) => {
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
                files[element.name] = element.subFolders;
                files["parent-"+element.name] = element.parentFolder;
            });
        }
    } else {
        
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

var files = {};

// * Debug
//localStorage.clear();
// [usr]{Documents,Applications} [Documents]{School Work, Other Stuff} [Applications]{} [School Work]{} [Other Stuff]{}
//console.log(localStorage.getItem('files'));
//localStorage('files', localStorage.getItem('files');
// localStorage.getItem('files')