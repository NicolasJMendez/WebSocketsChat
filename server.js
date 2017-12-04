//Set debug mode // 0 = off, 1 = on
var debugMode = 1;
var app = require('http').createServer();
var io = require('socket.io')(app);
var fs = require('fs');
//Start listening for connectiosn
app.listen(80);
if (debugMode == 1) {console.log("server running");}

//user connection handlers
var SOCKET_LIST = {};
var chatLog = [];
var users = [];

//On new user connection
io.sockets.on("connection", function(socket){

  //Asign a unique ID to a new user and pass it to the socket list array
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  //On new user connect
  socket.on("newUser", function(data){
    if (debugMode == 1) {console.log(data.Name+" has joined");}
    users.push(data.Name);
    socket.userName = data.Name;
    //If there are previous logs, send them to user
    if (chatLog.length > 0) {
      
      var log = "";
      var maxLength = 20;
      for (var i = 0; i < chatLog.length; i++) {
        //if there are more than "maxLength" logs, then exit the for loop
        if (i >= maxLength) { break;}
          log = chatLog[i]+log;
      }
      socket.emit('chatLog', {logs: log});      
    }



    //send message to everyone saying there is a new user
    socket.broadcast.emit('newConnection', {Name: data.Name});
    socket.broadcast.emit('userList', {array: users});
  });

  //On user disconnect
  socket.on("disconnect", function(){
    //Send out a message stating that a user has left then remove the user from the array
    socket.broadcast.emit('terminatedConnection', {Name:socket.userName});
    if (debugMode == 1) {console.log(socket.userName+" has disconnected");}
    delete SOCKET_LIST[socket.id];
    //remove user from users array then send the new list
    users = users.filter(e => e !== socket.userName);
    socket.broadcast.emit('userList', {array: users});
  });

  //On a user message
  socket.on("message", function(data){
    //Parse message for server variables
    var message = data.Msg;

    //if the message contains a command
    if (message.search("!server") == 0) {
      switch(message.slice(8)) {
          case "report":
                
              break;
          case "request":
                
              break;
          case "message":
                
              break;
          default:
              socket.emit("server", {Type: "helpMessage", Msg: "You can type !server followed by one of the following: \"report\", \"request\" or \"message\". These currently do not work."});
      }
      // socket.emit("server", {Msg: data.Msg, userName: socket.userName});
    }else{
      //Build message for logs to be sent out to new users (not very scalable, quick fix)
      chatLog.unshift("<li><span class='blue-text'>"+socket.userName+": </span>"+data.Msg+"</li>");
      socket.broadcast.emit("newMessage", {Msg: data.Msg, userName: socket.userName});
    }
  });
});