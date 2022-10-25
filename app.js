const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose');
const session = require('express-session')
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

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


const UserSchema = new mongoose.Schema({
    username : String,
    password : String
    //posts: Array
});
const postSchema = new mongoose.Schema({
    title : String,
    post : String
});

UserSchema.plugin(passportLocalMongoose);

const Post_Model = new mongoose.model("Post",postSchema);
const User_model = new mongoose.model("User",UserSchema);

passport.use(User_model.createStrategy());
passport.serializeUser(User_model.serializeUser());
passport.deserializeUser(User_model.deserializeUser());

const homeStartingContent = "Welcome to your own Journal Page. \n Make a new entry by pressing the 'New Post' button. \n Delete the post by clicking 'Read More' on the post and clicking the 'Delete Post' button in the post page.";
const aboutContent = "The website frontend is written using EJS, CSS.\n The backend uses NodeJS(Express) and MongoDB(Mongoose) for storing the Posts.";
const contactContent = "Email id : vikaskaly@gmail.com \n Phone number : 8762175731";



app.get("/",function(req,res){
    // Post_Model.find({},function(err,foundList){
    //     if(err){
    //         console.log(err);
    //     }else{
    //         if(foundList){
    //             res.render("home",{"content":homeStartingContent,"posts":foundList});
    //         }else{
    //             res.render("home",{"content":homeStartingContent,"posts":[]});
    //         }
    //     }
    // });
    if(req.isAuthenticated()){
        //Find the blog posts
        res.render("home",{"content":homeStartingContent,"posts":[],"authenticated":true});
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
    res.render("signup");
});

app.get("/login",function(req,res){
    res.render("login");
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
    const this_id=req.params.postName;
    User_model.findOne({_id:req.user.id},function(err,res){

    });
    Post_Model.findOne({_id : this_id},function(err,result){
        if(!err){
            res.render('post',{thePost : result})
        }
    })
});


app.post("/compose",function(req,res){
    const post=new Post_Model({
        title : req.body.title , 
        post : req.body.post
    });
    post.save(function(err){
        if(err){
            console.log(err);
        }else{
            console.log("New post saved.")
        }
    });
    res.redirect("/");
});

app.post("/delete",function(req,res){
    const id_to_be_deleted= req.body.deleteButton;
    Post_Model.deleteOne({_id:id_to_be_deleted},function(err){
        if(err){
            console.log(err);
        }
    });
    res.redirect("/");
});

app.post("/signup",(req,res)=>{
    User_model.register({"username":req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/");
        }else{
            passport.authenticate("local")(req,res,function(){
                console.log("User Added successfully");
                res.redirect("/");
            });
        }
    });
});
app.post("/login",function(req,res){
    const user = new User_model({
        username:req.body.username,
        password:req.body.password
    });
    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/");
            });
        }
    });
});
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
