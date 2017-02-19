module.exports.loginFunc = function(req, res) {
  pool.getConnection(function(err, connection){
    if(err){
      console.log(err);
      return;
    }
    connection.query("SELECT * FROM user WHERE username = '"+ req.body.user +"' AND password = '"+ md5(req.body.pass) +"'", function(error, results){
      if(error){
        console.log(error);
        return;
      }
      if(results.length > 0) {
        // console.log(results);
        req.session.username = results[0].username;
        req.session.UUID = results[0].UUID;
        req.session.pic = results[0].profile_picture;
        req.session.save();
        // console.log(req.session);

        // SEND DATA
        res.contentType("json")
        res.send({username: req.session.username, picture: req.session.pic });
      } else {
        console.log("geen gebruiker");
      }
    });
    // res.render("login", {test: "fuck you"}, function(err){
    //   if(err){
    //     console.log(err);
    //   }
    //   console.log("run chat");
    // });
  });
}
