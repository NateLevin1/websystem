class About {
    static newWindow(name, description, version, thumbnailSrc) {
        let win = new Window(345, 216, "About "+name, 345/em, 216/em, {resizeDisabled: true });
        let window = win.getWindow();
        let containerDiv = document.createElement("div");
        containerDiv.classList.add("about-container", "unselectable");
        window.appendChild(containerDiv);

        let thumbnailContainer = document.createElement("div");
        thumbnailContainer.style.width = "100%";

        let thumb = document.createElement("img");
        thumb.src = thumbnailSrc;
        thumbnailContainer.appendChild(thumb);

        containerDiv.appendChild(thumbnailContainer);

        let titleDiv = document.createElement("div");
        titleDiv.innerText = "About "+name;
        titleDiv.style.fontWeight = "bold";
        titleDiv.style.width = "100%";
        titleDiv.style.fontSize = "1.5em";
        containerDiv.appendChild(titleDiv);

        let descDiv = document.createElement("div");
        descDiv.innerText = description;
        containerDiv.appendChild(descDiv);

        let versionDiv = document.createElement("div");
        versionDiv.style.fontSize = "0.8em";
        versionDiv.style.width = "100%";
        // versionDiv.style.fontStyle = "italic";
        versionDiv.innerText = "Version "+version;
        containerDiv.appendChild(versionDiv);
    }
}
GlobalStyle.newClass("about-container", "height: calc(100% - 1em);", "width: 100%;", "display: flex;", "flex-flow: wrap;", "align-items: center;", "justify-content: center;", "color: black;", "text-align: center;");