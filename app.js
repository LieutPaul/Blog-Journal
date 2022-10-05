const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose=require('mongoose');

const app = express();
mongoose.connect("mongodb://localhost:27017/blogDB",{useNewURLParser:true});
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const postSchema = new mongoose.Schema({
    title : String,
    post : String
});
const Post_Model = mongoose.model("Post",postSchema);

const homeStartingContent = "Welcome to your own Journal Page. \n Make a new entry by pressing the 'New Post' button. \n Delete the post by clicking 'Read More' on the post and clicking the 'Delete Post' button in the post page.";
const aboutContent = "The website frontend is written using EJS, CSS.\n The backend uses NodeJS(Express) and MongoDB(Mongoose) for storing the Posts.";
const contactContent = "Email id : vikaskaly@gmail.com \n Phone number : 8762175731";



app.get("/",function(req,res){
    Post_Model.find({},function(err,foundList){
        if(err){
            console.log(err);
        }else{
            if(foundList){
                res.render("home",{"content":homeStartingContent,"posts":foundList});
            }else{
                res.render("home",{"content":homeStartingContent,"posts":[]});
            }
        }
    });
});

app.get("/about",function(req,res){
    res.render("about",{"content":aboutContent});
});
app.get("/contact",function(req,res){
    res.render("contact",{"content":contactContent});
});

app.get("/compose",function(req,res){
    res.render("compose");
});

app.get("/posts/:postName",function(req,res){
    const this_id=req.params.postName;
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
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
