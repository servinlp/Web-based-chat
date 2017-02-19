var socket = io();

if($("button.logout")[0]){
  document.querySelector("button.logout").addEventListener("click", function(event){
    socket.emit("destroy");
  });
}

// LOGIN/REGISTER TOGGLE
if($(".home")[0]){
  $("section.login .switch .btn:not(.active)").on("click", function() {
    $("section.login").hide()
    $("section.register").show()
  });
  $("section.register .switch .btn:not(.active)").on("click", function() {
    $("section.register").hide()
    $("section.login").show()
  });
}

// REGISTER ACCOUNT
$("#register").submit(function(e) {
  e.preventDefault();
  var username  = $("input[name='username']").val(),
      password  = $("input[name='password']").val(),
      passAgain = $("input[name='password_again']").val();

  if(password != passAgain) {
    console.log("not the same");
    // return;
  }
  console.log(this);
  this.submit();
});


$("#login").submit(function(e){
  e.preventDefault();
  var username = $("input[name='username_log']").val(),
      password = $("input[name='password_log']").val();

  console.log("run");

  $.post("/login", {user: username, pass: password}, function(data){
    console.log(data);
    loadChat(data.username, data.picture);
  });
});

function loadChat(name, picture) {
  var body = document.querySelector("div#body"),
  load = "<div class'loadingchat'></div>"
  text = load +
  "<aside>" +
    "<header>"+
      "<input type='text' name='name' placeholder='search'>"+
      "<img src='img/search.svg'>"+
    "</header>"+
    "<div class='contact'>"+
      "<figure class='online'>"+
        "<img src='img/profile.jpg'>"+
      "</figure>"+
      "<section>"+
        "<h2>John doe</h2>"+
        "<p>Online</p>"+
      "</section>"+
    "</div>"+
    "<div class='contact'>"+
      "<figure>"+
        "<img src='img/profile.jpg'>"+
      "</figure>"+
      "<section>"+
        "<h2>John doe</h2>"+
        "<p>Offline</p>"+
      "</section>"+
    "</div>"+
    "<button class='logout'>logout</button>"+
  "</aside>"+
  "<main>"+
    "<header>"+
      "<figure>"+
        "<img src='img/profile.jpg'>"+
      "</figure>"+
      "<section>"+
        "<h1>John doe</h1>"+
        "<p>Offline</p>"+
      "</section>"+
    "</header>"+
    "<section>"+
      "<ul>"+
        "<li class='recieved'>"+
          "<h5>"+
            "<span>John</span>9.18, Today"+
          "</h5>"+
          "<article>"+
            "<p>Are we meeting today? Are we meeting today? Are we meeting today? Are we meeting today? Are we meeting today?</p>"+
          "</article>"+
        "</li>"+
        "<li class='send'>"+
          "<h5>"+
            "<span>"+ name +"</span>9.19, Today"+
          "</h5>"+
          "<article>"+
            "<p>Are we meeting today? Are we meeting today? Are we meeting today? Are we meeting today? Are we meeting today?</p>"+
          "</article>"+
        "</li>"+
      "</ul>"+
    "</section>"+
    "<footer>"+
      "<form action='' method='post'>"+
        "<textarea name='message' placeholder='Type your message'></textarea>"+
        "<input type='submit' name='name' value='Send'>"+
      "</form>"+
    "</footer>"+
  "</main>";
  body.classList.remove("home");
  body.innerHTML = text;
  $("div#body aside, div#body main").load(function(){
    body.removeChild(load);
    console.log("run");
  });
}

$("aside .contact").on("click", function(){
  $("main .overlay").removeClass("overlay");
  $("aside .contact").removeClass("inChat");
  $(this).addClass("inChat");

  var contactUUID   = $(this).attr("data-UUID"),
      contactSocket = $(this).attr("data-socket"),
      img = $(this).find("img").attr("src"),
      name = $(this).find("h2").text(),
      status = $(this).find("figure").attr("class");

  $("main header").attr("data-UUID", contactUUID);
  $("main header").attr("data-socket", contactSocket);
  $("main header img").attr("src", img);
  document.querySelector("main header h1").innerHTML = name;
  $("main header figure").addClass(status);

  var x = typeof status == "undefined" ? document.querySelector("main header p").innerHTML = "Offline" : document.querySelector("main header p").innerHTML = "Online";

  socket.emit("get_message", {contactUUID: contactUUID});
});

$("form.messageSubmit").submit(function(e){
  e.preventDefault();
  sendMessage();
});

// BESTAAT OM TE KUNNEN ROEPEN OP ENTER
function sendMessage(){
  var text = $("form.messageSubmit textarea").val(),
  to = $("main header").attr("data-UUID"),
  fromUser = $("main h1").text(),
  toSocket = $("main header").attr("data-socket"),
  date = new Date();
  // console.log(to);
  // console.log(fromUser);
  // newMessage(fromUser, text, date);
  socket.emit("message_send", {message: text, to: to, fromUser: fromUser, toSocket: toSocket});
  $("form.messageSubmit textarea").val("");
}

socket.on("recieve_message", function(data){
  if (data.length > 0) {
    document.querySelector("main > section ul").innerHTML = "";
    data.forEach(function(val, unit){
      // console.log(val); <-- object
      newMessage(val.from_user_UUID, val.message, val.created_at);
    });
  } else if(typeof data.message === "string") {
    newMessage(data.fromUser, data.message, data.timestamp);
  } else {
    document.querySelector("main > section ul").innerHTML = "<li class='empty'>There are no messages</li>";
  }
});

function newMessage(fromWho, message, timestamp) {
  var fromMe = [$("#body > section h2").text(), "send"],
      meUUID = $("#body > section h2").attr("data-uuid"),
      date = timestamp.substr(5, 5),
      time = timestamp.substr(11, 5);
  if(fromWho != meUUID){
    fromMe = [$("main header section h1").text(), "recieved"];
  }
  var text = "<li class='"+fromMe[1]+"'><h5><span>"+fromMe[0]+"</span>"+date+" "+time+"</h5><article><p>"+message+"</p></article></li>";
  document.querySelector("main > section ul").innerHTML += text;
}

socket.on("set_socket_id", function(data){
  // console.log(data);
  var item = $(".contact[data-uuid='"+data.UUID+"']")
  // console.log(item);
  item.attr("data-socket", data.id);
  if(item.hasClass("inChat")){
    $("main header").attr("data-socket", data.id);
  }
});

socket.on("set_every_socket_id", function(data){
  var item;
  for(var eachSocket in data) {
    item = $(".contact[data-uuid='"+data[eachSocket].UUID+"']");
    item.attr("data-socket", data[eachSocket].socket_id);
  }
});

socket.on("update_status", function(data){
  if(data.status == 0){
    var item = $(".contact[data-uuid='"+data.UUID+"']");
    item.find("figure").toggleClass("online");
    item.find("p").text("Offline");
  } else {
    var item = $(".contact[data-uuid='"+data.UUID+"']");
    item.find("figure").toggleClass("online");
    item.find("p").text("Online");
  }
});

// TEXTAREA BEHEAVOR
if(document.querySelectorAll("form.messageSubmit textarea")[0]){
  var map = [];
  document.querySelector("form.messageSubmit textarea").onkeydown = onkeyup = function(e)  {
    e = e || event;
    map[e.keyCode] = e.type == "keydown";
    // console.log(map);
    // SHIFT + ENTER
    if (map[16] && map[13]) {
          document.querySelector("form.messageSubmit textarea").innerHTML += "\n";
    } else if(map[13]) {
      e.preventDefault();
      sendMessage();
    }
  }
}

// OPEN PROFIEL SHIT
if(document.querySelectorAll("aside.me")[0]){
  document.querySelector("aside.me").addEventListener("click", function(){
    document.querySelector("#body > section").classList.toggle("open");
  });
  document.querySelector("#body > section header img").addEventListener("click", function(){
    document.querySelector("#body > section").classList.toggle("open");
  });
}
