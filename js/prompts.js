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
    wind.style.zIndex = "42";

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
        box.close();
        cover.remove();
    }

    // remove window on red x pushed
    wind.addEventListener("window-destroy", ()=>{
        cover.remove();
    }, { once:true });


    const keydownHandler = (event)=>{
        if(box.isClosed()) {
            document.removeEventListener("keydown", keydownHandler);
        }
        if(event.key == "Enter" || event.key == " ") {
            box.close();
            cover.remove();
        }
        if(!document.body.contains(cover)) {
            document.removeEventListener("keydown", keydownHandler);
        }
    }
    document.addEventListener("keydown", keydownHandler);
}


/**
 * Prompt the user to enter input.
 * @param {String} message 
 * @param {String} defaultValue - The default value for the input. Not a placeholder, a value.
 * @param {String} fontSize - The font size to be used for the text.
 * @returns {Promise<(String|null)>} Returns a promise with the result being null if cancel is pressed and the value of the input if OK is pressed. 
 */
window.prompt = (message, defaultValue="", fontSize="1.2")=>{
    return new Promise((resolve)=>{
        let cover = coverScreen();
        let box = makeAlertWindow("Prompt");

        let wind = box.getWindow();
        wind.style.zIndex = "42";

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
            if(!isRemoving) {
                cover.remove();
                resolve(null); // emulate normal confirm() behavior
            }
        }, { once:true });
        let isRemoving = false;

        function remove(isCancel) {
            isRemoving = true;
            box.close();
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
        wind.style.zIndex = "42";

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
            if(!isRemoving) {
                cover.remove();
                resolve(false);
            }
        }, { once:true });
        let isRemoving = false;

        function remove(isCancel) {
            isRemoving = true;
            box.close();
            cover.remove();
            resolve(!isCancel); // emulate normal confirm() behavior
        }

        let cancelFocused = defaultCancel;

        const keydownHandler = (event)=>{
            if(box.isClosed()) {
                document.removeEventListener("keydown", keydownHandler);
            }
            if(event.key == "Enter" || event.key == " ") {
                remove(cancelFocused);
            }

            if(event.key == "Tab") {
                event.preventDefault(); // tabbing to another element
                if(cancelFocused) {
                    cancelFocused = false;
                    cancel.classList.remove("default-button");
                    ok.classList.add("default-button");
                } else {
                    cancelFocused = true;
                    cancel.classList.add("default-button");
                    ok.classList.remove("default-button");
                }
            }

            if(!document.body.contains(cover)) {
                document.removeEventListener("keydown", keydownHandler);
            }
        }
        document.addEventListener("keydown", keydownHandler);
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
    cover.style.zIndex = "41";
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