var express = require('express');
var exphbs = require('express-handlebars');
var app = express();
const DataStore = require('nedb');
db = new DataStore({
    filename: 'noteDB',
    autoload: true
});

app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(express.static('public')); // For static assets
var bodyParser = require('body-parser');
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({
    extended: false
})
var commonmark = require('commonmark');
var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();

app.get('/', function (req, res) {
    db.find({}).sort({"datetime": 1}).exec(function (err, docs) {
        if (err) {
            console.log("Something went wrong");
        } else {
            console.log("it worked");
            for(var d of docs) {
                var date = new Date(d.datetime);
                d.datetime = date.toLocaleString();
            }
            res.render('allNotes',{notes: docs});
        }
    });
});

app.post('/deleteForm', urlencodedParser, function(req,res) {
    console.log(req.body);
    var id = Object.keys(req.body);
    for(var i = 0 ; i < id.length; i++) {
    db.remove({_id : id[i] }, {multi:true}, function(err,numRemoved) {
        if(err) {
            console.log("something went wrong");
        } else {
            console.log("numremoved " + numRemoved);
        }
    })
    }
    res.redirect('/');
});

app.get('/deleteForm', function(req,res){
        console.log("delete form");
      db.find({}).sort({"datetime": 1}).exec(function (err, docs) {
        if (err) {
            console.log("Something went wrong");
        } else {
            console.log("it worked");
            for(var d of docs) {
                var date = new Date(d.datetime);
                d.datetime = date.toLocaleString();
            }
            res.render('deleteForm',{notes: docs});
        }
    });
   
});

app.get('/noteForm', function(req,res) {
   res.render('noteForm') ;
});

// Respond to post request from form page.
app.post('/notePost', urlencodedParser, function (req, res) {
    var dateTime = new Date();
    req.body.user_content = renderMessage(req.body.user_content);
    db.insert(Object.assign({datetime: dateTime.valueOf()}, req.body), function (err, newDocs) {
        if (err) {
            console.log("something went wrong");
            console.log(err);
        } else {
            console.log(newDocs);
            res.redirect('/note/' + newDocs._id);
        }
    });
});

app.get('/note/:noteID', function(req,res) {
    var id = req.params.noteID;
   // console.log(id);
    db.findOne({_id: id}, function(err,docs) {
        if(err) {
            console.log("Something went wrong");
        } else {
            var date = new Date(docs.datetime);
            docs.datetime = date.toLocaleString();
            res.render('note', docs);
        }
    });
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
