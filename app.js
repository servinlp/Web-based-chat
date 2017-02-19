var Session      = require("express-session"),
    SessionStore = require('session-file-store')(Session);
    session = Session({
      store: new SessionStore({path: __dirname+'/tmp/sessions'}),
      UUID: "",
      user: "",
      secret: 'pass',
      cookie: {
        expires: new Date(Date.now() + 60 * 10000),
        maxAge: 60*10000
      },
      test: "",
      resave: true,
      saveUninitialized: true
    }),
    express      = require("express"),
    uuid         = require("node-uuid"),
    favicon      = require('serve-favicon'),
    mysql        = require("mysql"),
    md5          = require("md5"),
    fs           = require("fs"),
    bodyParser   = require("body-parser"),
    multer       = require("multer"),
    app          = express(),
    register     = require("./include/register"),
    login        = require("./include/login"),
    start        = require("./include/start"),
    ioFunc       = require("./include/ioInclude"),
    pool         = mysql.createPool({
      connectionLimit : 100,
      host      : "127.0.0.1",
      user      : "root",
      password  : "root",
      database  : "chat",
      debug : false
    });

app.use(express.static(__dirname + "/public/"));
app.set("view engine", "jade");

app.use(session);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function(req, res, next){
  if (req.url === '/img/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'} );
        res.end(/* icon content here */);
    } else {
        next();
    }
});

app.get("/", function(req, res){
  start.startFunc(req, res);
});

app.post("/", multer({dest: "./public/profile-pics/"}).single("profile"), function(req, res){
  register.registerFunc(req, res);
});

app.post("/login", function(req, res){
  login.loginFunc(req, res);
});

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////


var http   = require("http"),
    server = http.createServer(app);
    server.listen("3000");
    // server     = app.listen(3000),
var ios        = require("socket.io-express-session"),
    io         = require("socket.io").listen(server),
    currentConnections = {};

io.use(ios(session));
// console.log(io.clients());
io.on("connection", function(socket) {
  // console.log(socket.handshake.session);
  // console.log(socket.id);
  // SET STATUS TO 1
  if(typeof socket.handshake.session.username != "undefined"){
    console.log("add socket id");
    currentConnections[socket.id] = {socket_id: socket.id + "test", UUID: socket.handshake.session.UUID};
    // currentConnections[socket.id] = {socket_id: socket.id, UUID: socket.handshake.session.UUID, client: socket};
    console.log(currentConnections);
    socket.emit("set_every_socket_id", currentConnections);
    io.sockets.emit("set_socket_id", {id: socket.id, UUID: socket.handshake.session.UUID});
    // socket.emit("set_socket_id", {id: socket.id, UUID: socket.handshake.session.UUID});
    pool.getConnection(function(err, connection){
      if(err){
        console.log(err);
        return;
      }
      connection.query("UPDATE user SET status = '1' WHERE username = '"+socket.handshake.session.username+"'", function(error, results){
        if(error){
          console.log(error);
          return;
        }
        console.log("SET STATUS TO 1");
        io.sockets.emit("update_status", {status: 1, UUID: socket.handshake.session.UUID});
      });
    });
  }

  socket.on("destroy", function(){
    console.log("destory");
    // SET STATUS TO 0
    //  if(typeof socket.handshake.session.username != "undefined"){
    if (typeof socket.handshake.session != "undefined" && typeof socket.handshake.session.username != "undefined"){
      delete currentConnections[socket.id];
       console.log("SET STATUS TO 0");
       pool.getConnection(function(err, connection){
         if(err){
           console.log(err);
           return;
         }
         connection.query("UPDATE user SET status = '0' WHERE username = '"+socket.handshake.session.username+"'", function(error, results){
           if(error){
             console.log(error);
             return;
           }
          //  console.log(results);
         });
       });
     }
     socket.handshake.session.destroy();
  });

  socket.on("get_message", function(data){
    console.log(data.contactUUID);
    console.log(socket.handshake.session.UUID);
    pool.getConnection(function(err, connection){
      if(err){
        console.log(err);
        return;
      }
      connection.query("SELECT * FROM message WHERE (from_user_UUID = '"+data.contactUUID+"' AND to_user_UUID = '"+socket.handshake.session.UUID+"') OR (from_user_UUID = '"+socket.handshake.session.UUID+"' AND to_user_UUID = '"+data.contactUUID+"') ORDER BY created_at", function(error, results){
        if (error) {
          console.log(error);
        }
        socket.emit("recieve_message", results);
        // console.log(results);
      });
    });
  });

  socket.on("message_send", function(data){
    // console.log(data);
    // socket.clients[rqJX0TsItK9Lz4HMAAB].send("recieve_message", {hoi: "hoi"});
    if(typeof data.toSocket != "undefined") {
      console.log("send to client");
      console.log(data.toSocket);
      console.log(currentConnections[data.toSocket]);
      var date = new Date();
      if (io.sockets.connected[data.toSocket]) {
          io.sockets.connected[data.toSocket].emit("recieve_message", {message: data.message, fromUser: data.fromUser, to: data.to, timestamp: date});
      }
    }
    pool.getConnection(function(err, connection){
      if(err){
        console.log(err);
        return;
      }
      var newID = uuid.v4();
      set = {UUID: newID, from_user_UUID: data.fromUser, to_user_UUID: data.to, message: data.message};
      connection.query("INSERT INTO message SET ?", set, function(error, results){
        if (error) {
          console.log(error);
          return;
        }
        // console.log(results);
        console.log("run add message query");
      });
    });
  });

  // USER DISCONNECT
  socket.on("disconnect", function(data){
   // DO ONCE USER LEAVES
   console.log("left");

    // SET STATUS TO 0
    //  if(typeof socket.handshake.session.username != "undefined"){
    if (typeof socket.handshake.session != "undefined" && typeof socket.handshake.session.username != "undefined"){
      delete currentConnections[socket.id];
       console.log("SET STATUS TO 0");
       pool.getConnection(function(err, connection){
         if(err){
           console.log(err);
           return;
         }
         connection.query("UPDATE user SET status = '0' WHERE username = '"+socket.handshake.session.username+"'", function(error, results){
           if(error){
             console.log(error);
             return;
           }
          io.sockets.emit("update_status", {status: 0, UUID: socket.handshake.session.UUID});
         });
       });
     }
  });
});
