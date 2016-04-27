/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// ------Setting up Express --------
var express = require('express');
var app = express();
//var randomstring = require('randomstring');

var port = process.env.VCAP_APP_PORT || 3000;
var host = process.env.VCAP_APP_HOST || 'localhost';

//-----------------------------------

var cfenv = require('cfenv');
var fs = require('fs');

//*-------Setting up login-logout support

var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require(__dirname + '/db');

//Local Passport strategy to authenticate users
passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      //return cb(null, false);
      if (!user) { console.log("username not found"); return cb(null, false); }
      if (password.localeCompare(user.PASSWORD) == 0) { console.log("Everything set"); return cb(null, user);}
      console.log("Password did not match"); return cb(null, false);

    });
  }));
  
passport.serializeUser(function(user, cb) {
  cb(null, user.USERID);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

//-------------------------------------*/

//------- CODE TO UPLOAD --------
var filepath;
var multer = require('multer');

//Setting up location and filename
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, __dirname + '/uploadedVideos/');
  },
  filename: function (req, file, callback) {
  	var date = new Date();
    filepath = date.getDay() + '-' + date.getMinutes() + '-' + Date.now();
    console.log("in multer!!!! " + filepath);
    callback(null, filepath);
  }
});

var upload = multer({ storage : storage}).single('userVideo');

//-------------------------------

// start server on the specified port and binding host
//Set up views and view engines
app.listen(port);
app.set('views', __dirname + '/public');
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');



//----------- ROUTES -----------------

app.get('/upload',function(req,res){
      res.render('upload');
});

//Uploads video to server
app.post('/api/video', function(req,res){
	upload(req,res,function(err) {
        if(err) {
            console.log(err);
			return res.end("Error uploading file.");
        }
        var title = "to-be-assigned";
  	    var descr = "still have to put something here";
    	var videopath = __dirname + '/uploadedVideos/' + filepath;
	  	db.users.insertVideo(videopath, req.user.USERID, title, descr, function(err) {
			if (err) {
				console.log(err);
				return res.end("Error uploading file.");
			}
			res.redirect('/edit?path=' + videopath);
		});
    });
  	
});

app.get('/edit' ,function(req, res){
	var path = req.query.path;
	res.render('edit', {path : path});
});

//Edit video title and description
app.post('/edit', function(req, res) {
	var path = req.query.path;
	var title = req.body.title;
	var dec = req.body.description;
	console.log(path);
	console.log(title);
	console.log(dec);
	db.users.updateVideo(path, title, dec, function(err) {
		if (err) {
			console.log(err);
			return res.end("Error updating video.");
		}
		res.redirect('/video?path=' + path);
	});
});

app.get('/video', function(req, res) {
	var videopath = req.query.path;		
	res.render('video', {path : videopath});
});

//Streams specifiv video path
app.get('/stream', function(req, res) {
	var upperpath = __dirname + '/uploadedVideos/';
	fs.readdir(upperpath, function(err, items) {
    console.log(items);
	    for (var i=0; i<items.length; i++) {
	        console.log(items[i]);
	    }
	});
	var path = req.query.path;  
	  var stat = fs.statSync(path);
	  var total = stat.size;
	  if (req.headers['range']) {
	  	console.log("contains range");
	    var range = req.headers.range;
	    var parts = range.replace(/bytes=/, "").split("-");
	    var partialstart = parts[0];
	    var partialend = parts[1];
	
	    var start = parseInt(partialstart, 10);
	    var end = partialend ? parseInt(partialend, 10) : total-1;
	    var chunksize = end - start + 1;
	    console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
	
	    var file = fs.createReadStream(path, {start: start, end: end});
	    res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
	    file.pipe(res);
	  } else {
	    console.log('ALL: ' + total);
	    res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
	    fs.createReadStream(path).pipe(res);
	  }

});

app.get('/',
  function(req, res) {
	db.users.allVideos(function(err, videos) {
		if (err) {
			console.log(err);
			res.redirect('/');
		}
		else
	    	res.render('index', { user: req.user, videos: videos });
	});
  });

app.get('/login',
  function(req, res){
    res.render('signin');
  });
  
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });
  
app.post('/register',
  function(req, res) {
  	db.users.insertUser(req.body.email, req.body.username, req.body.password, function(err, value) {
  	if (err) console.error(err);
  });
    res.redirect('/');
  });
  
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/profile', require('connect-ensure-login').ensureLoggedIn(), function(req, res){
	db.users.allVideosID(req.user.USERID, function(err, videos) {
		if (err) {
			console.log(err);
			res.redirect('/');
		}
		else {
			console.log(videos);
	    	res.render('mypage', { user: req.user, videos : videos });
		}
	});
  });

