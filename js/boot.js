/**
 * Begin boot sequence.
 * Runs on page onload.
 */
function boot() {
    let name = localStorage.getItem("name");
    if(!name) {
        firstLogin = true;
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
            // Set Name
            localStorage.setItem("name", newAccountName.value);
            // set global name value
            NAME = newAccountName.value;
            // Set Downloads
            localStorage.setItem('downloads', '');


            // Setup localforage file system
            if(window.Worker) {
                let setup = new Worker('js/setup.js');
                setup.postMessage(NAME);
                setup.onmessage = (event) => {
                    fadeAndRemove(dialogboxcontainer, true);
                }
            } else { // pseudo polyfill for browsers that don't support webworkers
                console.warn("No webworker support. May be buggy.");
                let loader = document.createElement("script");
                loader.src = "js/setup.js";
                document.body.appendChild(loader);
                setTimeout(()=>{
                    filesystem.getItem("folders").then((data)=>{
                        fadeAndRemove(dialogboxcontainer, true);
                    });
                }, 30);
            }
        }

        dialogboxcontainer.appendChild(dialogbox);
        document.body.appendChild(dialogboxcontainer);
    } else {
        // there is a name already, initiate desktop opening
        startDesktop();
    }
    
}
function setFileSystem() {
    mainContent.classList.add("main-content");
    document.body.appendChild(mainContent);
    // Set folders{} to correct value
    filesystem.getItem("folders").then((result)=>{
        folders = result;

        // ! DEBUG
        console.log(folders);

        // add all app scripts to the document
        for(const val in folders) {
            let file = folders[val];
            if(file.kind == "App" && !makeFunctions[file.name]) { // if is an app and not installed by default
                Appstore.installApp(file.name, file.content);
            }
        }

        filesystem.iterate((value, key)=>{
            if(key != "folders") {
                if(key != "account") {
                    files[key] = value;
                } else {
                    account = value;
                }
            }
        }).then(()=>{
            if(isSafari && firstLogin) { // add the websystem logo.png file
                FileSystem.deleteAnyAtLocation("/Users/"+NAME+"/Desktop/WebSystem/logo.png/");
                FileSystem.removeAsSubfolder("/Users/"+NAME+"/Desktop/WebSystem/", "/Users/"+NAME+"/Desktop/WebSystem/logo.png/");
                fetch("../assets/trash.png")
                .then(function(response) {
                    return response.blob();
                })
                .then(function(blob) {
                    // convert to file
                    let data = new File([blob], "logo.png", {lastModified: new Date(), type:"image/png"});
                    FileSystem.addFileAtLocation("logo.png", data, "Image", "/Users/"+NAME+"/Desktop/WebSystem/");
                });
            }
            document.dispatchEvent(fileSystemReady);
            // add desktop once folders and files is done
            new Desktop;
        });
    });
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
    welcomeText.innerText = "Welcome, "+NAME+".";
    welcomeTextContainer.appendChild(welcomeText);
    document.body.appendChild(welcomeTextContainer);

    // Add top bar
    new TopBar;
    // Show desktop + set folders to correct value
    setFileSystem();
    

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

var mainContent = document.createElement("div");
var firstLogin = false;

/**
 * The account object. Holds data about the account.
 * @property accounts - All accounts on this browser.
 * @property admin - The admin account on this browser.
 */
var account = {};

/**
 * Called on the document when the file system has been fully loaded.
 */
var fileSystemReady = new Event("file-system-ready");

// * Debug
//localStorage.clear();
// FileSystem.clearAll();