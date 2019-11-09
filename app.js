//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _ = require('lodash');

// Require mongoose
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// connect and create or change to db
mongoose.connect('mongodb://localhost/postlistDB', {useNewUrlParser: true, useUnifiedTopology: true });

// Check if the connection was succefull
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connection Succefull");
});

// ---------------------------------------SCHEMAS---------------------------------------------------------
// Create Schema
const postsSchema = new mongoose.Schema({
  name: String,
  post: String,
  category: String
});

// ---------------------------------------COLLECTIONS-----------------------------------------------------
// Mongoose will convert the word Fruit into plurar to crate a collection
const Post = mongoose.model('Post', postsSchema);

// ----------------------------------------DOCUMENTS------------------------------------------------------
const postHome = new Post({
  name: 'homeStartingContent',
  post: "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.",
  category: 'home'
});

const postAbout = new Post({
  name: 'aboutContent',
  post: "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.",
  category: 'about'
});

const postContact = new Post({
  name: 'contactContent',
  post: "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.",
  category: 'contact'
})

// default posts
const defaultPosts = [postHome, postAbout, postContact];

// Adding route for every post
app.get("/posts/:id", (req, res) => {

  console.log(`This post id is: ${req.params.id}`);
  Post.find({category: 'home'}, function (err, foundPosts){
    for(let i = 0; i < foundPosts.length; i++){
      if(_.lowerCase(foundPosts[i]._id) === _.lowerCase(req.params.id))
        res.render('post', {title: foundPosts[i].name, post: foundPosts[i].post});
    }
  });
});

// Adding route for the homePage
app.get("/", (req, res) => {
  //--------------------------------------FIND-DOCUMENTS--------------------------------------------------

  Post.find({category: 'home'}, function (err, foundPosts) {
    if (foundPosts.length === 0){
// ----------------------------------------ADD-DOCUMENTS-------------------------------------------------
      Post.insertMany(defaultPosts, function(err){
        if(err) console.log(err);
        else console.log('Succefully saved default Posts');
      });
      // render the objects after adding them to the db
      res.redirect('/');
    }
    else {
      // it's necessary to have a views folder and the file inside
      res.render('home', {
        posts: foundPosts
      });
    }
  });
});

// Adding route for the aboutPage
app.get("/about", (req, res) => {
  Post.findOne({category: 'about'}, function (err, foundPost){
    if(err) console.log(err);
    else res.render('about', {aboutText: foundPost.post});
  });
});

// Adding route for the contactPage
app.get("/contact", (req, res) => {
  Post.findOne({category: 'contact'}, function (err, foundPost){
    if(err) console.log(err);
    else res.render('contact', {contactText: foundPost.post});
  });
});

// Adding route for the compose page
app.get("/compose", (req, res) => {
  res.render('compose');
});

// Adding a post method for compose
app.post("/compose", (req, res) => {
  const post = new Post({
    name: req.body.title,
    post: req.body.post,
    category: 'home'
  });
  post.save();
  // It's redirect to the get method
  res.redirect('/');
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
