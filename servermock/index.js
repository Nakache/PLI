var app = require('express')();
 
app.get('/posts', function (req, res) {
console.log("Hey, nice to see you !");
var posts = [
{title: "test", description:"La vie est belle sur un surf ! #Plage #Soleil ", image:"https://i.pinimg.com/564x/98/0c/af/980caf3395ad00665dda4a67964511fb.jpg", date: "5 minutes ago", coordinates: {latitude: 47.902964, longitude: 1.909251
}},
{title: "test2", description:"Mon amour d'amour <3 On est trop beauw avec notre skate jtm biz", image:"https://i.pinimg.com/736x/67/a0/c7/67a0c70623dee21770dfb926a24b4a2e--skateboarding-couples-skater-couple.jpg", date: "5 minutes ago", coordinates: {latitude: 47.105325, longitude: 1.209251
}},
]
res.setHeader('Content-Type', 'application/json');  
console.log(posts)
res.json(posts);
});

app.get('/comments/:postID', function (req, res) {
console.log("Hey, nice to see you !");
var comments = [
{
   content: "Superbe photo"
},
{
   content: "Génial, tout simplement"
},
]
res.setHeader('Content-Type', 'application/json');
console.log(comments)
res.json(comments);
});
 
var server = app.listen(3000, function () {
  var host = server.address().address;
  host = (host === '::' ? 'localhost' : host);
  var port = server.address().port;
 
  console.log('listening at http://%s:%s', host, port);
});
