var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var stream = require('stream');
var liner = new stream.Transform( { objectMode: true } );
var mysql = require('mysql');
var WP = require('wordpress-rest-api');
var wprest = new WP({
	endpoint: 'http://192.168.1.109/admin',
/*	username: 'drewmcarthur1',
	password: 'bingo'*/
});
/*
var wp_auth = require('wordpress-auth').create( 'http://192.168.1.109',
                      'testphrase',
                      'testphrase',
                      'localhost',
                      'wordpressuser',
                      'imedia',
                      'wordpress',
                      'wp_' );
*/

var sqlconnarg = { //arguments for the sql connection
	host : "localhost",
	user : "wordpressuser",
	password : "imedia",
	database: "wordpress"
};
var db = mysql.createConnection(sqlconnarg); // connect to database
handleDisconnect(); //fixes errors caused by the mysql database connection ending after a timeout

app.use(express.static(__dirname + '/public')); // allow access to all files in ./public

app.get('/admin',function(req,res){
	res.send('Username: ' + req.query['username']);
/*
	wprest.users().me()._options.username = req.body.username;
	wprest.users().me()._options.password = req.body.password;

	if(wprest.users().me()._options.auth){
		res.send("Logged In");
	}else{
		res.redirect("/admin/login");
	}
/*
	wp_auth.checkAuth( req ).on( 'auth', function( auth_is_valid, user_id ) {
			auth_is_valid; // true if the user is logged in, false if they are not
			user_id; // the ID number of the user or 0 if the user is not logged in
			console.log(auth_is_valid + "\n" + user_id);
			if(auth_is_valid){ res.send("logged in"); } else { res.send("not logged in"); };
	} );
*/
	console.log("getting /admin");
});
app.get('/admin/login',function(req,res){
	console.log("getting /login");
	res.sendFile(__dirname + "/public/login.html");
});

function handleDisconnect(){
	db = mysql.createConnection(sqlconnarg); // connect to database
	db.connect(function(err) {              // The server is either down
		if(err) {                                     // or restarting (takes a while sometimes).
			console.log('error when connecting to db:'+ err);
			setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
		}                                     // to avoid a hot loop, and to allow our node script to
	});                                     // process asynchronous requests in the meantime.
	// If you're also serving http, display a 503 error.
	db.on('error', function(err) {
		console.log('db error', err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
			handleDisconnect();                         // lost due to either server restart, or a
		} else {                                      // connnection idle timeout (the wait_timeout
			//throw err;                                  // server variable configures this)
		}
	});
}

http.listen(8000, function(){ //listen for requests at ipaddress:80
	console.log('Server is running on port 8000');  //callback function, completely optional.
});

