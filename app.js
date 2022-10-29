const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose');
const session = require('express-session')
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
var $ = require("jquery")(window);

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret : "Our little secret.", 
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/blogDB",{useNewURLParser:true});

const postSchema = new mongoose.Schema({
    title : String,
    post : String
});

const UserSchema = new mongoose.Schema({
    name : String,
    username : String,
    password : String,
    posts: [postSchema]
});


UserSchema.plugin(passportLocalMongoose);
const User_model = new mongoose.model("User",UserSchema);

passport.use(User_model.createStrategy());
passport.serializeUser(User_model.serializeUser());
passport.deserializeUser(User_model.deserializeUser());

const homeStartingContent = "Welcome to your own Journal Page. \n Make a new entry by pressing the 'New Post' button. \n Delete the post by clicking 'Read More' on the post and clicking the 'Delete Post' button in the post page.";
const aboutContent = "The website frontend is written using EJS, CSS.\n The backend uses NodeJS(Express), MongoDB(Mongoose) and PassportJS for storing the Posts and Users.";
const contactContent = "Email id : vikaskaly@gmail.com \n Phone number : 8762175731";



app.get("/",function(req,res){
    if(req.isAuthenticated()){
        User_model.findOne({username : req.user.username},(err,foundUser)=>{
            if(err){
                console.log(err);
            }else{
                if(foundUser){
                    res.render("home",{"content":homeStartingContent,"posts":foundUser.posts,"authenticated":true,"name":req.user.name});
                }
            }
        });
    }else{
        const homeStartingContent2=homeStartingContent+"\n <br><br><br><br><h3> <center> Sign-up to start using the App";
        res.render("home",{"content":homeStartingContent2,"posts":[],"authenticated":false});
    }
});

app.get("/about",function(req,res){
    res.render("about",{"content":aboutContent});
});
app.get("/contact",function(req,res){
    res.render("contact",{"content":contactContent});
});

app.get("/compose",function(req,res){
    if(req.isAuthenticated()){
        res.render("compose");
    }else{
        res.redirect("/login");
    }
    
});

app.get("/signup",function(req,res){
    res.render("signup",{userExists:false});
});

app.get("/signuperror",function(req,res){
    res.render("signup",{userExists:true});
});

app.get("/login",function(req,res){
    res.render("login",{invalidUser:false});
});

app.get("/loginerror",function(req,res){
    res.render("login",{invalidUser:true});
});
app.get("/logout",function(req,res){
    req.logout(function(err){
        if(err){ 
            return next(err); 
        }
        res.redirect('/');
    });
});

app.get("/posts/:postName",function(req,res){
    const post_id=req.params.postName;
    User_model.findOne({username : req.user.username},(err,foundUser)=>{
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                const post=foundUser.posts.id(post_id);
                res.render('post',{thePost : post, "name":req.user.name});
            }
        }
    });
    
});




app.post("/compose",function(req,res){
    const post={
        title : req.body.title , 
        post : req.body.post
    };
    User_model.findOne({username : req.user.username},(err,foundUser)=>{
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                foundUser.posts.push(post);
                foundUser.save();
            }
        }
    });
    res.redirect("/");
});

app.post("/delete",function(req,res){
    const post_id = req.body.deleteButton;
    User_model.findOne({username : req.user.username},(err,foundUser)=>{
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                foundUser.posts.id(post_id).remove();
                foundUser.save((err)=>{
                    console.log(err);
                });
                res.redirect("/");
            }
        }
    });
    
});

app.post("/signup",(req,res)=>{
    User_model.register({"username":req.body.username,"name":req.body.name},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/signuperror");
        }else{
            passport.authenticate("local",{failureRedirect:'/signuperror',failureMessage: true })(req,res,function(){
                console.log("User Added successfully");
                res.redirect("/");
            });
        }
    });
});

app.post("/login",function(req,res){
    const user = new User_model({
        username : req.body.username,
        password : req.body.password
    });
    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local",{failureRedirect:'/loginerror',failureMessage: true })(req,res,function(){
                res.redirect("/");
            });
        }
    });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
