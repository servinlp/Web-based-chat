

module.exports.statusZero = function(){
  if (typeof socket.handshake.session != "undefined" && typeof socket.handshake.session.username != "undefined"){
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
}
