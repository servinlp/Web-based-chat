
module.exports.registerFunc = function(req, res) {
  console.log("ren iets");
  // ADD FILE EXTENTION TO NAME
  fs.rename("./public/profile-pics/" + req.file.filename, "./public/profile-pics/" + req.file.filename + ".jpg", function(err){
    if(err){
      console.log(err);
    }
  });
  // ADD NEW ACCOUNT TO DATABASE
  var userID = uuid.v4();
  pool.getConnection(function(err, connection){
    if(err){
      console.log(err);
      return;
    }
    var set = {UUID: userID, username: req.body.username, password: md5(req.body.password), profile_picture: req.file.filename + ".jpg"};
    connection.query("INSERT INTO user SET ?", set, function(error, results){
      if(error){
        console.log(error);
      }
      // console.log("run");
    });
  });
  res.status(204).end();
}
