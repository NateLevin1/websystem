document.addEventListener("file-system-update", (event)=>{
    if(event.parentPath == trashPath) {
        setTimeout(()=>{ // prevents weirdness with how deleting stuff works. Stupid fix but it works and has no impact on UX.
            // fill or empty the trash icon
            let oldSrc = mainContent.querySelector(".trash-can").src;
            let imgSrc = "assets/emptyTrash.png";
            if(folders[trashPath].subfolders.length != 0) {
                // fill trash
                imgSrc = "assets/trash.png";
            }

            // only update dom if we need to
            if(oldSrc != imgSrc) { // if the source has not changed
                let trashes = mainContent.querySelectorAll(".trash-can");
                trashes.forEach((trash)=>{
                    trash.src = imgSrc;
                });
            }
        }, 10);
    }
});