// Tom Dinh Server Side Stuff

var express = require('express');
var exphbs = require('express-handlebars');
var app = express();
var sanitizeHTML = require('sanitize-html');
const DataStore = require('nedb');
db = new DataStore({
    filename: 'noteDB',
    autoload: true
});

app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(express.static('public')); 
var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({
    extended: false
})
var commonmark = require('commonmark');
var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();

// goes to the default page where it renders all the notes
app.get('/', function (req, res) {
    db.find({}).sort({"datetime": -1}).exec(function (err, docs) {
        if (err) {
            console.log("Something went wrong");
        } else {
            console.log("it worked");
            for(var d of docs) {
                d.datetime = new Date(d.datetime).toLocaleString();
            }
            res.render('allNotes',{notes: docs});
        }
    });
});
// responds to post deleteform, deletes all the checked boxes
app.post('/deleteForm', urlencodedParser, function(req,res) {
    console.log(req.body);
    var id = Object.keys(req.body);
    var toDel = [];
    for(var i of id) {
        toDel.push({_id: i});
    }
    console.log(toDel);
//    for(var i = 0 ; i < id.length; i++) {
    db.remove({$or: toDel}, {multi:true}, function(err,numRemoved) {
        if(err) {
            console.log("something went wrong");
        } else {
            console.log("removed " + numRemoved);
        }
    });
//    }
    res.redirect('/');
});
// gets the deleteform after clicking the link
app.get('/deleteForm', function(req,res){
      
      db.find({}).sort({"datetime": -1}).exec(function (err, docs) {
        if (err) {
            console.log("Something went wrong");
        } else {
             console.log("delete form");
            for(var d of docs) {
                d.datetime = new Date(d.datetime).toLocaleString();
            }
            res.render('deleteForm',{notes: docs});
        }
    });
   
});
// just gets the noteform
app.get('/noteForm', function(req,res) {
   res.render('noteForm') ;
});

// Respond to post request from new note page
app.post('/notePost', urlencodedParser, function (req, res) {
    var dateTime = new Date();
    var myObj = req.body;
    myObj.user_content = renderMessage(myObj.user_content);
    
    db.insert(Object.assign({datetime: dateTime.valueOf()}, myObj), function (err, newDocs) {
        if (err) {
            console.log("something went wrong");
            console.log(err);
        } else {
            console.log(newDocs);
            res.redirect('/note/' + newDocs._id);
        }
    });
});
// Respond to get after clicking note link
app.get('/note/:noteID', function(req,res) {
    var id = req.params.noteID;
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
// renders the message so that it works with markdown
function renderMessage(info) {
    let m = sanitizeHTML(info);
    let parsed = reader.parse(m);
    let message = writer.render(parsed);
    
    return `${message}`;
}


const host = '127.0.0.1';
const port = '5555';
app.listen(port, host, function () {
    console.log("app listening on IPv4: " + host +
        ":" + port);
});
