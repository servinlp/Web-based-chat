module.exports.startFunc = function(req, res) {
  // IF LOGGED IN
  console.log(req.session.username);
  if(typeof req.session.username != "undefined"){
    console.log("username");
    pool.getConnection(function(err, connection){
      if(err){
        console.log(err);
        return;
      }
      connection.query("SELECT * FROM user WHERE UUID != '" + req.session.UUID + "'", function(error, results){
        // console.log(results[0]);
        res.render('index', {home: "false", name: req.session.username, UUID: req.session.UUID, users: results});
        res.end();
      });
    });

  } else {
    console.log("no-username");
    res.render('index', {home: "true"});
    res.end();
  }
}
