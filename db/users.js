

/*eslint-env node */
exports.getServiceCreds = function(name) {
   //console.log("getting service creds for " + name);
   if (process.env.VCAP_SERVICES) {
      var services = JSON.parse(process.env.VCAP_SERVICES);
      //console.log(services);
      for (var service_name in services) {
      	 //console.log(service_name);
         if (service_name.indexOf(name) === 0) {
            var service = services[service_name][0];
            //console.log("returning credentials: " + service);
            return {
               port: service.credentials.port,
               hostname: service.credentials.hostname,
               username: service.credentials.username,
               password: service.credentials.password,
               db: service.credentials.db
            };
         }
      }
   }
   else {
   	  //console.log("problem getting services");
      return {};
   }
};


exports.findById = function(id, cb) {
  /*require the ibm_db module*/
  var ibmdb = require('ibm_db');
  var creds = exports.getServiceCreds("sqldb");
  var connString = "DRIVER={DB2};DATABASE=" + creds.db + ";UID=" + creds.username + ";PWD=" + creds.password + ";HOSTNAME=" + creds.hostname + ";PORT=" + creds.port;
  var result;
  ibmdb.open(connString, function(err, conn)
	{
        if(err) {	
          	console.error("error: ", err.message);
        } else {
	
		
		var query = "select * from users where userid = '" + id + "'";
		conn.query(query, function(err, users, moreResultSets) {
			if (err) {
				conn.close(cb(new Error(err)));
			}
			result = users[0];
			
			conn.close(cb(null, result));
		});
	}
  });
};

exports.findByUsername = function(username, cb) {
  /*require the ibm_db module*/
  var ibmdb = require('ibm_db');
  var creds = exports.getServiceCreds("sqldb");
  var connString = "DRIVER={DB2};DATABASE=" + creds.db + ";UID=" + creds.username + ";PWD=" + creds.password + ";HOSTNAME=" + creds.hostname + ";PORT=" + creds.port;
  var result;
  ibmdb.open(connString, function(err, conn)
	{
		
        if(err) {
          	console.error("error: ", err.message);
        } else {
	
		var query = "SELECT * from " + creds.username + ".USERS where username = '" + username + "'";
		console.log(query);
		conn.query(query, function(err, users, moreResultSets) {
			if (err) {
				console.log("In conn.query");
				conn.close(cb(new Error(err)));
			}
			result = users[0];
			
			conn.close(cb(null, result));
		});
	}
  //console.log("calling cb");
  //cb(null, result);
  });
};

exports.insertUser = function(userid, username, password, cb) {
  /*require the ibm_db module*/
  var ibmdb = require('ibm_db');
  var creds = exports.getServiceCreds("sqldb");
  var connString = "DRIVER={DB2};DATABASE=" + creds.db + ";UID=" + creds.username + ";PWD=" + creds.password + ";HOSTNAME=" + creds.hostname + ";PORT=" + creds.port;
  ibmdb.open(connString, function(err,conn) {
  if (err) cb(err, false);
  conn.beginTransaction(function (err) {
    if (err) {
      //could not begin a transaction for some reason. 
      conn.closeSync();
      cb(err, false);
    }
 
    var query = "INSERT INTO " + creds.username + ".USERS VALUES ('" + userid + "','" + username +"','" + password + "')";
    console.log("inserting:- " + query);
    var result = conn.querySync(query);
 
    conn.commitTransaction(function (err) {
      if (err) {
        //error during commit 
        console.log(err);
        return conn.close(err, null);
      }
     //Close the connection 
     conn.close(cb(null, true));
    });
  });
}); 
};

exports.insertComment = function(handle, text, videoid, cb) {
  /*require the ibm_db module*/
  var ibmdb = require('ibm_db');
  var creds = exports.getServiceCreds("sqldb");
  var connString = "DRIVER={DB2};DATABASE=" + creds.db + ";UID=" + creds.username + ";PWD=" + creds.password + ";HOSTNAME=" + creds.hostname + ";PORT=" + creds.port;
  ibmdb.open(connString, function(err,conn) {
  if (err) cb(err, false);
  conn.beginTransaction(function (err) {
    if (err) {
      //could not begin a transaction for some reason. 
      conn.closeSync();
      cb(err, false);
    }
 
    var query = "INSERT INTO " + creds.username + ".COMMENTS (HANDLE,TEXT,VIDEOID,TIMEMADE) VALUES ('" + handle + "','" + text +"','" + videoid + "','" + Date.now() + "')";
    console.log("inserting:- " + query);
    var result = conn.querySync(query);
 
    conn.commitTransaction(function (err) {
      if (err) {
        //error during commit 
        console.log(err);
        return conn.close(err, null);
      }
     //Close the connection 
     conn.close(cb(null, true));
    });
  });
}); 
};

exports.findCommentbyID = function(id, cb) {
  /*require the ibm_db module*/
  var ibmdb = require('ibm_db');
  var creds = exports.getServiceCreds("sqldb");
  var connString = "DRIVER={DB2};DATABASE=" + creds.db + ";UID=" + creds.username + ";PWD=" + creds.password + ";HOSTNAME=" + creds.hostname + ";PORT=" + creds.port;
  var result;
  ibmdb.open(connString, function(err, conn)
	{
		
        if(err) {
          	console.error("error: ", err.message);
        } else {
	
		var query = "SELECT * from " + creds.username + ".COMMENTS where VIDEOID = " + id;
		console.log(query);
		conn.query(query, function(err, users, moreResultSets) {
			if (err) {
				console.log("In conn.query");
				conn.close(cb(new Error(err)));
			}
			//console.log(users['PASSWORD']);
			result = users;
			
			conn.close(cb(null, result));
		});
	}
  //console.log("calling cb");
  //cb(null, result);
  });
};

exports.findVideoByID = function(id, cb) {
  /*require the ibm_db module*/
  var ibmdb = require('ibm_db');
  var creds = exports.getServiceCreds("sqldb");
  var connString = "DRIVER={DB2};DATABASE=" + creds.db + ";UID=" + creds.username + ";PWD=" + creds.password + ";HOSTNAME=" + creds.hostname + ";PORT=" + creds.port;
  var result;
  ibmdb.open(connString, function(err, conn)
	{
        if(err) {	
          	console.error("error: ", err.message);
        } else {
	
		
		var query = "SELECT * from " + creds.username + ".VIDEOS where VIDEOID = " + id;
		conn.query(query, function(err, users, moreResultSets) {
			if (err) {
				conn.close(cb(new Error(err)));
			}
			result = users[0];
			
			conn.close(cb(null, result));
		});
	}
  });
};

exports.findVideoByPath = function(path, cb) {
  /*require the ibm_db module*/
  var ibmdb = require('ibm_db');
  var creds = exports.getServiceCreds("sqldb");
  var connString = "DRIVER={DB2};DATABASE=" + creds.db + ";UID=" + creds.username + ";PWD=" + creds.password + ";HOSTNAME=" + creds.hostname + ";PORT=" + creds.port;
  var result;
  ibmdb.open(connString, function(err, conn)
	{
        if(err) {	
          	console.error("error: ", err.message);
        } else {
	
		
		var query = "SELECT * from " + creds.username + ".VIDEOS where PATH = '" + path + "'";
		conn.query(query, function(err, users, moreResultSets) {
			if (err) {
				conn.close(cb(new Error(err)));
			}
			result = users[0];
			
			conn.close(cb(null, result));
		});
	}
  });
};

exports.allVideos = function(cb) {
  /*require the ibm_db module*/
  var ibmdb = require('ibm_db');
  var creds = exports.getServiceCreds("sqldb");
  var connString = "DRIVER={DB2};DATABASE=" + creds.db + ";UID=" + creds.username + ";PWD=" + creds.password + ";HOSTNAME=" + creds.hostname + ";PORT=" + creds.port;
  var result;
  ibmdb.open(connString, function(err, conn)
	{
		
        if(err) {
          	console.error("error: ", err.message);
        } else {
	
		var query = "SELECT * from " + creds.username + ".VIDEOS";
		console.log(query);
		conn.query(query, function(err, users, moreResultSets) {
			if (err) {
				console.log("In conn.query");
				conn.close(cb(new Error(err)));
			}
			//console.log(users['PASSWORD']);
			//console.log("users" + users);
			result = users;
			//console.log("result" + result);
			
			conn.close(cb(null, result));
		});
	}
  });
};

exports.allVideosID = function(id, cb) {
  /*require the ibm_db module*/
  var ibmdb = require('ibm_db');
  var creds = exports.getServiceCreds("sqldb");
  var connString = "DRIVER={DB2};DATABASE=" + creds.db + ";UID=" + creds.username + ";PWD=" + creds.password + ";HOSTNAME=" + creds.hostname + ";PORT=" + creds.port;
  var result;
  ibmdb.open(connString, function(err, conn)
	{
		
        if(err) {
          	console.error("error: ", err.message);
        } else {
	
		var query = "SELECT * from " + creds.username + ".VIDEOS WHERE userid = '" + id + "'";
		console.log(query);
		conn.query(query, function(err, users, moreResultSets) {
			if (err) {
				console.log("In conn.query");
				conn.close(cb(new Error(err)));
			}
			result = users;
			
			conn.close(cb(null, result));
		});
	}
  });
};

exports.insertVideo = function(videopath, userid, title, description, cb) {
  /*require the ibm_db module*/
  var ibmdb = require('ibm_db');
  var creds = exports.getServiceCreds("sqldb");
  var connString = "DRIVER={DB2};DATABASE=" + creds.db + ";UID=" + creds.username + ";PWD=" + creds.password + ";HOSTNAME=" + creds.hostname + ";PORT=" + creds.port;
  ibmdb.open(connString, function(err,conn) {
  if (err) cb(err);
  conn.beginTransaction(function (err) {
    if (err) {
      //could not begin a transaction for some reason. 
      conn.closeSync();
      return cb(err);
    }
 
    var query = "INSERT INTO " + creds.username + ".VIDEOS (PATH,USERID,TITLE,DESCRIPTION) VALUES ('" + videopath +"','" + userid + "','" + title + "','--not specified--')";
    console.log("inserting:- " + query);
    var result = conn.querySync(query);
 
    conn.commitTransaction(function (err) {
      if (err) {
        //error during commit 
        console.log(err);
        return conn.close(cb(err));
      }
     //Close the connection 
     conn.close(cb(null));
    });
  });
}); 
};

exports.updateVideo = function(videopath, title, description, cb) {
  var ibmdb = require('ibm_db');
  var creds = exports.getServiceCreds("sqldb");
  var connString = "DRIVER={DB2};DATABASE=" + creds.db + ";UID=" + creds.username + ";PWD=" + creds.password + ";HOSTNAME=" + creds.hostname + ";PORT=" + creds.port;
  ibmdb.open(connString, function(err,conn) {
  if (err) cb(err);
  conn.beginTransaction(function (err) {
    if (err) {
      //could not begin a transaction for some reason. 
      conn.closeSync();
      return cb(err);
    }
 
    var query = "UPDATE " + creds.username + ".VIDEOS SET title = '" + title + "', description = '" + description + "' WHERE path = '" + videopath +"'";
    console.log("inserting:- " + query);
    var result = conn.querySync(query);
 
    conn.commitTransaction(function (err) {
      if (err) {
        //error during commit 
        console.log(err);
        return conn.close(cb(err));
      }
     //Close the connection 
     conn.close(cb(null));
    });
  });
});

};
