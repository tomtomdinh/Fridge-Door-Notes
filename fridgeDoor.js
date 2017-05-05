
/*
    Example of post form handling, markdown processing and static files.
*/
var express = require('express');
var app = express();
app.use(express.static('public')); // For static assets
var bodyParser = require('body-parser');
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var commonmark = require('commonmark');
var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();

// Respond to post request from form page.
app.post("/notePost", urlencodedParser, function(req, res) {
	console.log(req.body);
    res.send(createHtmlMessage(req.body));
});

function createHtmlMessage(info) {
    let parsed = reader.parse(info.user_content);
    let message = writer.render(parsed);
    return `${message}`;
}

const host = '127.0.0.1';
const port = '5555';
app.listen(port, host, function () {
    console.log("app listening on IPv4: " + host +
	":" + port);
});
