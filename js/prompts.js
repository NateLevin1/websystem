/**
 * WebSystem's version of window.alert(). Almost exactly the same as alert(),
 * though it notably does not pause the site. (Which is important in the context of an operating system)
 * 
 * @param {String} message - The message to be given to the user
 * @param {String} fontSize - The font size (in em) for the window to use.
 */
window.alert = (message, fontSize="1.2")=>{
    let cover = coverScreen();
    let box = makeAlertWindow("Alert");

    let wind = box.getWindow();
    wind.style.zIndex = "13";

    let container = makeContainer(wind);

    let header = box.getHeader();
    makeHeaderNoMove(header);
    

    let content = document.createElement("div");
    content.style.minWidth = "90%";
    content.style.display = "inline-block";
    content.style.overflow = "hidden";
    content.style.alignSelf = "flex-start";
    content.style.textAlign = "center";
    content.style.margin = "auto 5%";
    content.style.fontSize = fontSize+"em";
    content.textContent = message;
    container.appendChild(content);

    let closeContainer = document.createElement("div");
    closeContainer.style.minWidth = "100%";
    closeContainer.style.margin = "auto";
    
    closeContainer.style.alignSelf = "flex-end";
    container.appendChild(closeContainer);
    
    let close = document.createElement("button");
    close.textContent = "Close";
    close.style.margin = "0 auto";
    close.style.fontSize = fontSize+"em";
    closeContainer.appendChild(close);

    close.onclick = ()=>{
        box.forceClose(); // no need to send an event because nothing else has access to this
        cover.remove();
    }

    // remove window on red x pushed
    wind.addEventListener("window-destroy", ()=>{
        cover.remove();
    });
}

/**
 * Prompt the user to enter input.
 * @param {String} message 
 * @param {String} defaultValue - The default value for the input. Not a placeholder, a value.
 * @param {String} fontSize 
 * @returns {Promise<(String|null)>} Returns a promise with the result being null if cancel is pressed and the value of the input if OK is pressed. 
 */
window.prompt = (message, defaultValue="", fontSize="1.2")=>{
    return new Promise((resolve)=>{
        let cover = coverScreen();
        let box = makeAlertWindow("Prompt");

        let wind = box.getWindow();
        wind.style.zIndex = "13";

        let container = makeContainer(wind);

        let header = box.getHeader();
        makeHeaderNoMove(header);

        let content = document.createElement("div");
        content.style.minWidth = "90%";
        content.style.display = "inline-block";
        content.style.overflow = "hidden";
        content.style.alignSelf = "flex-start";
        content.style.textAlign = "center";
        content.style.margin = "auto 5%";
        content.style.fontSize = fontSize+"em";
        content.textContent = message;
        container.appendChild(content);

        let input = document.createElement("input");
        input.style.minWidth = "70%";
        input.style.display = "inline-block";
        input.style.overflow = "hidden";
        input.style.margin = "auto 5%";
        input.style.fontSize = "1em";
        input.type = "text";
        input.value = defaultValue;
        container.appendChild(input);

        input.onkeydown = (event)=>{
            if(event.key == "Enter") {
                remove(input.value);
            }
        }
        setTimeout(()=>{
            input.focus();
            input.select();
        }, 50);

        let buttonContainer = document.createElement("div");
        buttonContainer.style.minWidth = "100%";
        buttonContainer.style.margin = "auto";
        buttonContainer.style.display = "flex";
        buttonContainer.style.alignSelf = "flex-end";
        container.appendChild(buttonContainer);
        
        let ok = document.createElement("button");
        ok.textContent = "OK";
        ok.style.margin = "0 auto";
        ok.style.fontSize = fontSize+"em";
        ok.style.minWidth = "5em";
        buttonContainer.appendChild(ok);

        let cancel = document.createElement("button");
        cancel.textContent = "Cancel";
        cancel.style.margin = "0 auto";
        cancel.style.fontSize = fontSize+"em";
        buttonContainer.appendChild(cancel);

        ok.classList.add("default-button");
        

        cancel.onclick = ()=>{ remove(null); };
        ok.onclick = ()=>{ remove(input.value); };

        // remove window on red x pushed
        wind.addEventListener("window-destroy", ()=>{
            remove(null);
        });

        function remove(isCancel) {
            box.forceClose(); // no need to send an event because nothing else has access to this
            cover.remove();
            resolve(isCancel); // emulate normal confirm() behavior
        }
    });
}

/**
 * Confirm something. Similar to window.confirm(), though is asynchronous and returns a promise.
 * @param {String} message 
 * @param {Boolean} defaultCancel 
 * @param {fontSize} fontSize 
 * @returns {Promise} Unlike normal window.confirm(), since other things can run in the background, this returns an asynchronous promise that resolves <code>true</code> if OK was pressed and <code>false</code> if Cancel was pressed.
 */
window.confirm = (message, defaultCancel=true, fontSize="1.2")=>{
    return new Promise((resolve)=>{
        let cover = coverScreen();
        let box = makeAlertWindow("Confirm");

        let wind = box.getWindow();
        wind.style.zIndex = "13";

        let container = makeContainer(wind);

        let header = box.getHeader();
        makeHeaderNoMove(header);

        let content = document.createElement("div");
        content.style.minWidth = "90%";
        content.style.display = "inline-block";
        content.style.overflow = "hidden";
        content.style.alignSelf = "flex-start";
        content.style.textAlign = "center";
        content.style.margin = "auto 5%";
        content.style.fontSize = fontSize+"em";
        content.textContent = message;
        container.appendChild(content);

        let buttonContainer = document.createElement("div");
        buttonContainer.style.minWidth = "100%";
        buttonContainer.style.margin = "auto";
        buttonContainer.style.display = "flex";
        buttonContainer.style.alignSelf = "flex-end";
        container.appendChild(buttonContainer);
        
        let ok = document.createElement("button");
        ok.textContent = "OK";
        ok.style.margin = "0 auto";
        ok.style.fontSize = fontSize+"em";
        ok.style.minWidth = "5em";
        buttonContainer.appendChild(ok);

        let cancel = document.createElement("button");
        cancel.textContent = "Cancel";
        cancel.style.margin = "0 auto";
        cancel.style.fontSize = fontSize+"em";
        buttonContainer.appendChild(cancel);

        if(defaultCancel == true) {
            cancel.classList.add("default-button");
        } else {
            ok.classList.add("default-button");
        }
        

        cancel.onclick = ()=>{ remove(true); };
        ok.onclick = ()=>{ remove(false); };

        // remove window on red x pushed
        wind.addEventListener("window-destroy", ()=>{
            remove(true);
        });

        function remove(isCancel) {
            box.forceClose(); // no need to send an event because nothing else has access to this
            cover.remove();
            resolve(!isCancel); // emulate normal confirm() behavior
        }
    });
}

function coverScreen() {
    // cover screen
    let cover = document.createElement("div");
    cover.style.width = "100%";
    cover.style.height = "100%";
    cover.style.position = "absolute";
    cover.style.top = "0";
    cover.style.left = "0";
    cover.style.zIndex = "12";
    let coversLength = mainContent.querySelectorAll(".semi-screen-cover").length;
    if(coversLength < 3) {
        cover.style.backgroundColor = "rgba(0,0,0,0.25)";
    } else if(coversLength => 4 && coversLength <= 8) {
        cover.style.backgroundColor = "rgba(0,0,0,"+((12 - coversLength)*0.01).toString()+")";
    } else {
        cover.style.backgroundColor = "none";
    }
    cover.classList.add("semi-screen-cover");
    mainContent.appendChild(cover);
    return cover;
}

function makeAlertWindow(name) {
    let boxWidth = 20;
    let boxHeight = 13;
    return new Window(0,0, name, boxWidth, boxHeight, {
        x: (window.innerWidth/em/2)-boxWidth/2,
        y: (window.innerHeight/em/2)-Math.round(boxHeight), // make it higher than the middle
        resizeDisabled: true,
        zIndexDisabled: true
    });
}

function makeHeaderNoMove(header) {
    header.classList.add("no-move", "no");
    header.childNodes.forEach((node)=>{
        if(!node.classList.contains("no-move")) {
            node.classList.add("no-move", "no");
        }
    });
}

function makeContainer(wind) {
    let container = document.createElement("div");
    container.style.height = "calc(100% - 1em)";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.flexDirection = "column";
    wind.appendChild(container);
    return container;
}