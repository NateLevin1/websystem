// Adapted with love from https://github.com/15Dkatz/beat-cors-server 
const express = require('express');
const request = require('request');
const hash = require('js-sha256');
const bodyParser = require('body-parser');
const router = express.Router();
const allapps = require("./jsons/apps.json");
const popularapps = require("./jsons/popular.json");
const recentapps = require("./jsons/recent.json");


const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});



// * USERNAMES+PASSWORD HANDLING
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// app.use("/set/", router);

// router.post('handle',(req, res) => {
//   console.log(req.body);
//   res.send("200: OKAY");
// });
// set username and password
// app.get(/set\/up\/[^/]+\//, (req,res) =>{
//   let data = req.path.substring(8, req.path.length);

// });
// app.get(/data\/[^\/]+/, (req, res) =>{
//   let data = req.path.substring(6, req.path.length);
//   console.log(hash.sha256.hmac("username", "password"));
//   res.send("200: OKAY");
// });

// * APP STORE
app.get(/applist\/popular/, (req, res) =>{ // popular list
  res.json(popularapps);
});
app.get(/applist\/recent/, (req, res) =>{ // recent list
  res.json(recentapps);
});
app.get(/applist\/search/, (req, res) =>{ // search list
  // ? Search on server instead of client?
  res.json(allapps);
});

// * PROXY
app.get(/p\/https*:\/\/.+\//, (req, res) => { // request, response, error
let realRequest = req.path.substring(3, req.path.length);
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