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

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";



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
