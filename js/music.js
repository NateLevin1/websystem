class Music {
    constructor(name="", path="") {
        var win;
        if(name && path) { // open player
            win = new Window(390, 142, "Music", 390/em,142/em, 20, 2.2, false);
        } else { // open standalone
            win = new Window(350, 140, "Music", 25,25, 20, 2.2);
        }
        
        this.window = win.getWindow();
        this.window.classList.add("unselectable");
        this.header = win.getHeader();
        this.win = win;
        this.win.setBackgroundColor("rgba(230, 230, 230, 0.9)");
        this.window.classList.add("heavy-blurred");

        this.contentContainer = document.createElement("div");
        this.contentContainer.style.height = "calc(100% - 1em)";
        // this.contentContainer.style.display = "flex";
        this.contentContainer.style.color = "rgb(40, 40, 40)";
        this.window.appendChild(this.contentContainer);

        if(name && path) {
            // disable resize
            this.window.querySelector(".resize").remove();

            let noResize = document.createElement("div");
            noResize.classList.add("resize");
            noResize.style.cursor = "url(assets/licensed/no.cur), url(assets/licensed/no.png), not-allowed";
            this.window.appendChild(noResize);

            this.openSong(name, path);
        }
    }
    openSong(name, path) {
        let artist = "";
        let genre = "";
        let tags = folders[path].content.mediaTags;
        if(tags) {
            // title, artist, genre, picture
            name = tags.tags.title;
            artist = tags.tags.artist;
            genre = tags.tags.genre;
        }

        let thumb = document.createElement("img");
        thumb.src = this.getThumbnail(tags);
        thumb.classList.add("music-song-thumbnail");
        this.contentContainer.appendChild(thumb);

        let info = document.createElement("div");
        info.classList.add("music-song-info");
        this.contentContainer.appendChild(info);

        let title = document.createElement("div");
        title.classList.add("music-song-title");
        title.innerHTML = name;
        info.appendChild(title);

        let artistText = document.createElement("div");
        artistText.classList.add("music-song-artist");
        artistText.innerHTML = artist;
        info.appendChild(artistText);

        let audio = document.createElement("audio");
        // audio.controls = true;
        audio.src = URL.createObjectURL(files[path]);
        info.appendChild(audio);
        audio.play();
        
        this.playing = true;

        let playPause = document.createElement("img");
        playPause.src = "assets/licensed/pause.png";
        playPause.classList.add("music-play-pause");
        playPause.onclick = ()=>{
            if(this.playing) {
                this.playing = false;
                audio.pause();
                playPause.src = "assets/licensed/play.png";
            } else {
                this.playing = true;
                audio.play();
                playPause.src = "assets/licensed/pause.png";
            }
        }
        info.appendChild(playPause);

        audio.addEventListener('ended', ()=>{
            this.playing = false;
        })
        
        audio.onloadedmetadata = ()=>{
            let duration = audio.duration;
            // create seeker
            let seeker = document.createElement("input");
            seeker.type = "range";
            seeker.classList.add("music-song-range");
            seeker.min = 0;
            seeker.max = duration;
            seeker.value = audio.currentTime;

            let minutes = Math.floor(duration / 60).toString();
            let seconds = Math.floor(duration % 60).toString();
            let prettyDuration = minutes+':'+seconds.padStart(2, '0');

            let timestamp = document.createElement("div");
            timestamp.innerText = "0:00/"+prettyDuration
            
            timestamp.classList.add("music-song-timestamp");
            info.appendChild(timestamp);

            seeker.onmousedown = ()=>{
                clearInterval(this.songAnimation);
            }
            seeker.onmouseup = ()=>{
                audio.currentTime = seeker.value;
                if(!this.playing) {
                    audio.play();
                }
                this.songAnimation = setInterval(()=>{
                    let c = audio.currentTime;
                    seeker.value = c;

                    // Update timestamp
                    let mins = Math.floor(c / 60).toString();
                    let secs = Math.floor(c % 60).toString();
                    timestamp.innerText = mins+":"+secs.padStart(2, '0')+"/"+prettyDuration;
                }, 100);
            }

            info.appendChild(seeker);

            // this.seeker = seeker;
            // this.audio = audio;
            // Animation

            this.songAnimation = setInterval(()=>{
                let c = audio.currentTime;
                seeker.value = c;

                // Update timestamp
                let mins = Math.floor(c / 60).toString();
                let secs = Math.floor(c % 60).toString();
                timestamp.innerText = mins+":"+secs.padStart(2, '0')+"/"+prettyDuration;
            }, 100);


            // cancel interval on window close
            this.window.addEventListener("window-destroy", ()=>{
                clearInterval(this.songAnimation);
            });
        }
    }

    getThumbnail(tags) {
        if(tags) {
            // jsmediatags thumbnail array to src: https://stackoverflow.com/a/45859810/
            let picture = tags.tags.picture; // create reference to track art
            let base64String = "";
            for (var i = 0; i < picture.data.length; i++) {
                base64String += String.fromCharCode(picture.data[i]);
            }
            return "data:" + picture.format + ";base64," + window.btoa(base64String);
        } else {
            // unknown, replace with "no track art" later
            return "assets/unknown.png";
        }
        
    }
}

appImagePaths["Music"] = "assets/musicPlayer.png";
makeFunctions["Music"] = ()=>{ new Music };


// STYLES
GlobalStyle.newClass("music-song-title", "overflow: hidden;", "white-space: nowrap;", "text-overflow: ellipsis;", "text-align: center;", "margin-top:5px;");
GlobalStyle.newClass("music-song-artist", "overflow: hidden;", "white-space: nowrap;", "text-overflow: ellipsis;", "text-align: center;", "font-size:0.8em;");
GlobalStyle.newClass("music-song-thumbnail", "width:30%;", "height:100%;", "display: inline-block;");
GlobalStyle.newClass("music-song-info", "display: inline-block;", "height:100%;", "vertical-align: top;", "font-size:1.3em;", "width:70%;");
GlobalStyle.newClass("music-play-pause", "margin-left:0.5em;", "width: 1.7em;", "max-width: 10%;", "transition: width 0.2s;", "position: absolute;", "top: 50%;");
GlobalStyle.newClass("music-play-pause:hover", "width: 1.8em;");
GlobalStyle.newClass("music-song-range", "position: absolute;", "top: 53%;", "right:3%;", "max-width:53%;");
GlobalStyle.newClass("music-song-timestamp", "position: relative;", "top: 38%;", "left:2%;", "max-width:0%;"/* Max width zero makes it so that it doesn't cover up other stuff*/);
// Below generated using this awesome website: http://danielstern.ca/range.css/?ref=css-tricks#/
GlobalStyle.addRaw(`input[type=range].music-song-range {
    width: 100%;
    margin: 5.5px 0;
    background-color: transparent;
    -webkit-appearance: none;
  }
  input[type=range].music-song-range:focus {
    outline: none;
  }
  input[type=range].music-song-range::-webkit-slider-runnable-track {
    background: #484d4d;
    border: 0;
    width: 100%;
    height: 15px;
    cursor: pointer;
  }
  input[type=range].music-song-range::-webkit-slider-thumb {
    margin-top: -5.5px;
    width: 12px;
    height: 26px;
    background: #ff4300;
    border: 0;
    cursor: pointer;
    -webkit-appearance: none;
  }
  input[type=range].music-song-range:focus::-webkit-slider-runnable-track {
    background: #575d5d;
  }
  input[type=range].music-song-range::-moz-range-track {
    background: #484d4d;
    border: 0;
    width: 100%;
    height: 15px;
    cursor: pointer;
  }
  input[type=range].music-song-range::-moz-range-thumb {
    width: 12px;
    height: 26px;
    background: #ff4300;
    border: 0;
    cursor: pointer;
  }
  input[type=range].music-song-range::-ms-track {
    background: transparent;
    border-color: transparent;
    border-width: 5.5px 0;
    color: transparent;
    width: 100%;
    height: 15px;
    cursor: pointer;
  }
  input[type=range].music-song-range::-ms-fill-lower {
    background: #393d3d;
    border: 0;
  }
  input[type=range].music-song-range::-ms-fill-upper {
    background: #484d4d;
    border: 0;
  }
  input[type=range].music-song-range::-ms-thumb {
    width: 12px;
    height: 26px;
    background: #ff4300;
    border: 0;
    cursor: pointer;
    margin-top: 0px;
    /*Needed to keep the Edge thumb centred*/
  }
  input[type=range].music-song-range:focus::-ms-fill-lower {
    background: #484d4d;
  }
  input[type=range].music-song-range:focus::-ms-fill-upper {
    background: #575d5d;
  }
  @supports (-ms-ime-align:auto) {
    /* Pre-Chromium Edge only styles, selector taken from hhttps://stackoverflow.com/a/32202953/7077589 */
    input[type=range].music-song-range {
      margin: 0;
      /*Edge starts the margin from the thumb, not the track as other browsers do*/
    }
  }
`);