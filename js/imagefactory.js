class Base64Image {
    // Base64 -> Image Tag
    /**
     * fromBase64(str)
     * Converts a base64 string to an img tag.
     * Returns an img tag with proper src.
     * @param {A string which represents an image in base64.} str 
     */
    fromBase64(str) {
        // make sure it is in proper form
        if(str.startsWith("data:image/png;base64,")) { 
            let img = document.createElement("img");
            img.src = str;
            return img;
        } else {
            console.error("Invalid base64 string. Does not start with 'data:image/png;base64,'. Argument received: "+str);
        }
    }
    /**
     * Example usage: */
     /*
        var a = new Base64Image;
        a.urlToBase64("assets/folder.png", (b64)=>{
            console.log(b64);
        });
     */
    /**
     * Take URL and convert to base64.
     * ! Note that this will not be useful unless the image at the url has no access control allow origin checks.
     * ! This function is not very useful in production but s kept because it may be useful to somebody
     * @param {URL to image} url 
     * @param {Callback to run when finished} callback
     */
    urlToBase64(url, callback) {
        // Taken from https://base64.guru/developers/javascript/examples/convert-image 
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        // The magic begins after the image is successfully loaded
        img.onload = function () {
            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d');

            canvas.height = img.naturalHeight;
            canvas.width = img.naturalWidth;
            ctx.drawImage(img, 0, 0);

            var uri = canvas.toDataURL('image/png');
                //b64 = uri.replace(/^data:image.+;base64,/, '');
            callback(uri);
        }
    }

    /**
     * fileToBase64(fileInstance, callback)
     * @param {The instance of the file from input type=file} fileInstance 
     * @param {A callback which is ran when it is done. Callback should have 1 parameter which is the base64 string} callback 
     */
    fileToBase64(fileInstance, callback) {
        var file = fileInstance.files[0];
        var a = new Base64Image;
        a.blobToBase64(file, (base)=>{
            callback(base);
        })
    }

    // from https://stackoverflow.com/a/40289667/13608595 
    blobToBase64(blob, callback) {
        var reader = new FileReader();
        reader.onload = function() {
            var dataUrl = reader.result;
            var base64 = dataUrl.split(',')[1];
            callback(base64);
        };
        reader.readAsDataURL(blob);
    }
}
var gotString = new Event("got-string");