// Adapted with love from https://github.com/15Dkatz/beat-cors-server 
const express = require('express');
const request = require('request');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get(/https*:\/\/.+\//, (req, res) => { // request, response, error
let realRequest = req.path.substring(1, req.path.length);
  request(
    { url: realRequest },
    (err, response, body) => {
      if (err || response.statusCode !== 200) {
        return res.status(500).json({ type: 'error', message: err.message });
      }
      // Various cases:

      //body = body.replace(/href=/, "href='"+realRequest+"'>")
      let hrefs = body.matchAll(/ href="\/?([^"]+)"/g); // \/ for relative only
      if(hrefs) {
        for(const element of hrefs) {
            if(!element[1].startsWith("javascript:")) { // not executing js
                body = body.replace(element[0], ' href="'+realRequest+element[1]+'"');
                //console.log("Updated href value from "+element[0]+"to "+'href="'+realRequest+element[1]);
            }
            
        };
      }

      let srces = body.matchAll(/ src="\/?([^/][^"]+)"/g); // \/ for relative only
      if(srces) {
        for(const element of srces) {
            body = body.replace(element[0], ' src="'+realRequest+element[1]+'"');
        };
      }

      // css urls
      let cssurls = body.match(/url\(\/[^)]+\)/g); // \/ for relative only
      if(cssurls) {
        cssurls.forEach(element => {
            body = body.replace(element, 'url('+realRequest+element.substring(5, element.length));
        });
      }
      
      // js image srces
      let jssrces = body.matchAll(/\.src ?= ?(?:"|')\/([^/])[^"']+(?:"|')/g); // \/ for relative only
      if(jssrces) {
        for(const element of jssrces) {
            body = body.replace(element[0], '.src="'+realRequest+"/"+element[1]+'"');
        };
      }

       res.send(body);
    }
  )
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));