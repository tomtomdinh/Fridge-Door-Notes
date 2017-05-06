var express = require('express');
var exphbs = require('express-handlebars');
var app = express();
const DataStore = require('nedb');
db = new DataStore({filename: 'noteDB', autoload: true});

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static('public')); // For static assets
var bodyParser = require('body-parser');
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var commonmark = require('commonmark');
var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();

// Respond to post request from form page.
app.post('/notePost', urlencodedParser, function(req, res) {
	console.log(req.body);
    var content = renderMessage(req.body.user_content);
    console.log(req.body.user_title);
    var info = {user_title: req.body.user_title, user_author: req.body.user_author, user_content: content};
    res.render('note', info);
    var dateTime = new Date();
    
    db.insert(Object.assign({datetime: dateTime.valueOf()},req.body),function(err,newDocs){
        if(err) {
            console.log("something went wrong");
            console.log(err);
        } else {
            console.log("added");
        }
    });
});

app.get('/', function(req,res) {
    let info = {user_title: "hello", user_author: "yo", datetime: "date", user_content: "# content"};
   res.render('note', info); 
});


function renderMessage(info) {
    let parsed = reader.parse(info);
    let message = writer.render(parsed);
    return `${message}`;
}


const host = '127.0.0.1';
const port = '5555';
app.listen(port, host, function () {
    console.log("app listening on IPv4: " + host +
	":" + port);
});
