class Music {
    constructor(name="", path="") {
        var win;
        if(name && path) { // open player
            win = new Window(390, 142, "Music", 24.375, 8.875, 20, 2.2, false);
        } else { // open standalone
            win = new Window(280, 380, "Music", 25,25, 10, 2.2);
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
        } else {
            this.openStandalone();
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
        thumb.src = Music.getThumbnail(tags);
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
        this.playPause = playPause;
        info.appendChild(playPause);



        audio.addEventListener('ended', ()=>{
            this.playing = false;
        });

        
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
                    this.playing = true;
                    audio.play();
                    this.playPause.src = "assets/licensed/pause.png";
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


            // LYRICS
            if(tags.tags.title) { // needed for lyrics
              let lyricsButton = document.createElement("div");
              this.contentContainer.style.maxHeight = "8em";
              lyricsButton.innerText = "Get Lyrics";
              lyricsButton.classList.add("music-song-lyrics-button");
  
              let lyricsShown = false;
              let lyrics = "";
  
              let lyricsText = document.createElement("div");
              lyricsText.innerText = lyrics;
              lyricsText.classList.add("music-song-lyrics-text");
              lyricsText.style.display = "none";
              this.window.appendChild(lyricsText);
  
              lyricsButton.onclick = ()=>{
                lyricsShown = !lyricsShown;
                if(!lyricsShown) {
                  lyricsText.style.display = "none";
                  lyricsButton.innerText = "Show Lyrics"; // lyrics are hidden
                  this.window.style.height = "8.875em";
                  seeker.style.top = "53%";
                  playPause.style.top = "50%";
                }
                if(lyricsShown) {
                  lyricsText.style.display = "block";
                  if(!lyrics) {
                    lyrics = "";
                    lyricsText.innerText = "Fetching lyrics... (This may take a few seconds)";
                    let control = new AbortController();
                    let signal = control.signal;
                    let requestTimeout = setTimeout(()=>{
                      control.abort();
                      lyrics = "Could not find any lyrics for this song.";
                      lyricsText.innerText = lyrics;
                    }, 7000); // abort after seven seconds. Safety.
                    // This is the Canarado api.
                    fetch(`https://canarado-lyrics.p.rapidapi.com/lyrics/${encodeURIComponent(name.toLowerCase().substring(0,name.indexOf("("))+" "+artist.toLowerCase())}`, {
                      signal,
                      "method": "GET",
                      "headers": {
                        "x-rapidapi-host": "canarado-lyrics.p.rapidapi.com",
                        "x-rapidapi-key": keys.lyrics
                      }
                    })
                    .then(response => {
                      return response.json();
                    })
                    .then((data)=>{
                      clearTimeout(requestTimeout);
                      if(data.status.code == "200") {
                        data.content.forEach((obj)=>{
                          if(!lyrics) {
                            if(artist.toLowerCase().includes(obj.artist.toLowerCase())||name.toLowerCase().includes(obj.title.toLowerCase())) {
                              if(obj.lyrics == "[Instrumental]") {
                                obj.lyrics = "This song is instrumental.";
                              }
                              lyrics = obj.lyrics;
                              lyricsText.innerText = lyrics;
                            }
                          }
                        });
                        if(!lyrics) {
                          lyrics = "Could not find any matching lyrics for this song.";
                          lyricsText.innerText = lyrics;
                        }
                      } else {
                        lyrics = "There was an error fetching the lyrics.";
                        lyricsText.innerText = lyrics;
                      }
                    })
                    .catch(err => {
                      lyrics = "There was an error fetching the lyrics.";
                      lyricsText.innerText = lyrics;
                      console.log(err);
                    });


                  }
                  lyricsButton.innerText = "Hide Lyrics"; // lyrics are shown
                  this.window.style.height = "25em";
                  seeker.style.top = "19%";
                  playPause.style.top = "17.8%";
                }
                // make window bigger
                // this.window.style.height = "25em";
              }
              this.window.appendChild(lyricsButton);
            }
        }
    }

    openStandalone() {
      this.win.setBackgroundColor("rgba(250, 250, 250, 0.9)");
      // search for all music
      let songPaths = [];
      let sorted = [];
      for(const path in files) {
        try {
          if(files[path].type.startsWith("audio")) { // is music
            songPaths.push(path);
            sorted.push({title: folders[path].content.mediaTags.tags.title, path:path});
          }
        } catch(e) {
          // Optional chaining doesn't have widespread browser support yet so this is the only way to stop the error. As an error can be expected, this does nothing.
        }
      }

      let top = document.createElement("div");
      top.classList.add("music-standalone-top");
      top.innerHTML = "All Music";
      this.contentContainer.appendChild(top);

      let scroll = document.createElement("div");
      scroll.classList.add("music-standalone-scroll");
      this.contentContainer.appendChild(scroll);

      songPaths.forEach((path, index)=>{
        let mediaTags = folders[path].content.mediaTags;

        let container = document.createElement("div");
        container.classList.add("music-standalone-song");
        if(index % 2 == 0) {
          container.classList.add("music-standalone-a");
        } else {
          container.classList.add("music-standalone-b");
        }

        let thumbnail = document.createElement("img");
        thumbnail.src = Music.getThumbnail(mediaTags);
        thumbnail.classList.add("music-standalone-thumbnail");
        container.appendChild(thumbnail);

        let info = document.createElement("div");
        info.classList.add("music-standalone-song-info");
        container.appendChild(info);

        let title = document.createElement("div");
        title.classList.add("music-standalone-song-title");
        title.innerText = mediaTags.tags.title;
        info.appendChild(title);

        let artist = document.createElement("div");
        artist.classList.add("music-standalone-song-artist");
        artist.innerText = mediaTags.tags.artist;
        info.appendChild(artist);

        let play = document.createElement("div");
        play.classList.add("music-standalone-song-play");
        play.innerText = "Play";
        play.onclick = ()=>{
          // create new player
          new Music(mediaTags.tags.title, path);
        }
        container.appendChild(play);


        scroll.appendChild(container);
      });
    }

    static getThumbnail(tags) {
        if(tags.tags.picture) {
            // jsmediatags thumbnail array to src: https://stackoverflow.com/a/45859810/
            let picture = tags.tags.picture; // create reference to track art
            let base64String = "";
            for (var i = 0; i < picture.data.length; i++) {
                base64String += String.fromCharCode(picture.data[i]);
            }
            return "data:" + picture.format + ";base64," + window.btoa(base64String);
        } else {
            // unknown, replace with "no track art" later
            return "assets/music.png";
        }
    }
}

appImagePaths["Music"] = "assets/musicPlayer.png";
makeFunctions["Music"] = ()=>{ new Music };

setTimeout(()=>{
  makeFunctions["Music"]();
}, 800);



// STYLES
GlobalStyle.newClass("music-song-title", "overflow: hidden;", "white-space: nowrap;", "text-overflow: ellipsis;", "text-align: center;", "margin-top:5px;");
GlobalStyle.newClass("music-song-artist", "overflow: hidden;", "white-space: nowrap;", "text-overflow: ellipsis;", "text-align: center;", "font-size:0.8em;");
GlobalStyle.newClass("music-song-thumbnail", "width:30%;", "height:100%;", "display: inline-block;");
GlobalStyle.newClass("music-song-info", "display: inline-block;", "height:100%;", "vertical-align: top;", "font-size:1.3em;", "width:70%;");
GlobalStyle.newClass("music-play-pause", "margin-left:0.5em;", "width: 1.7em;", "max-width: 10%;", "transition: width 0.2s;", "position: absolute;", "top: 50%;");
GlobalStyle.newClass("music-play-pause:hover", "width: 1.8em;");
GlobalStyle.newClass("music-song-range", "position: absolute;", "top: 53%;", "right:3%;", "max-width:53%;");
GlobalStyle.newClass("music-song-timestamp", "position: relative;", "top: 38%;", "left:2%;", "max-width:0%;"/* Max width zero makes it so that it doesn't cover up other stuff*/);
GlobalStyle.newClass("music-searching-text", "position: absolute;", "top: 50%;", "left: 50%;", "transform: translate(-50%,-50%);", "font-size: 2em;", "text-align: center;");
GlobalStyle.newClass("music-song-lyrics-button", "position: absolute;", "bottom:2%;", "right:2%;", "background-color:rgb(54, 207, 227);", "padding: 0.2em;", "border:2px solid black;", "cursor: pointer;", "font-size:0.7em;")
GlobalStyle.newClass("music-song-lyrics-text", "width: 100%;", "padding-top: 2%;", "height: 50%;", "overflow: auto;", "color:black;", "margin-left:0.2em;");
GlobalStyle.newClass("music-standalone-top", "border-bottom: 2px solid black;", "font-size:2em;", "text-align:center;");
GlobalStyle.newClass("music-standalone-scroll", "overflow-y:auto;", "overflow-x: hidden;", "height:calc(100% - 2.9em);");
GlobalStyle.newClass("music-standalone-a", "background-color: rgb(250,250,250);");
GlobalStyle.newClass("music-standalone-b", "background-color: rgb(230,230,230);");
GlobalStyle.newClass("music-standalone-song", "width:100%;");
GlobalStyle.newClass("music-standalone-song-info", "max-width: 45%;", "display: inline-block;", "vertical-align: top;", "margin-top:0.5em;");
GlobalStyle.newClass("music-standalone-song-title", "display:inline-block;", "padding-left:4px;", "padding-top:4px;", "max-width: 100%;", /** Ellipsis ahead */ "overflow: hidden;", "white-space: nowrap;", "text-overflow: ellipsis;");
GlobalStyle.newClass("music-standalone-song-play", "padding:0.5em 1em;", "font-size:1em;", "background-color: rgb(0,250,40);", "border:2px solid black;", "float: right;", "margin:0.5em 0.5em;", "transition: background-color 0.1s;", "cursor: pointer;");
GlobalStyle.newClass("music-standalone-song-play:active", "background-color:white;");
GlobalStyle.newClass("music-standalone-song-artist", "font-size:0.7em;", "display:block;", "padding-left:4px;", "max-width: 100%;", /** Ellipsis ahead */ "overflow: hidden;", "white-space: nowrap;", "text-overflow: ellipsis;");
GlobalStyle.newClass("music-standalone-thumbnail", "max-height:4em;");
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