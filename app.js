//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin_aya:TestingYoGo_1234@cluster0.h4npj.mongodb.net/blogDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const postSchema ={ title: String,
content: String};
const Post = mongoose.model ("Post", postSchema);



app.get("/", function(req, res) {
Post.find({}, function(err,posts){
  if(!err){
    res.render("home", {
      homeContent: homeStartingContent,
      posts: posts
    });
  }
});
});


app.get("/about", function(req, res) {
  res.render("about", {
    aboutContent: aboutContent
  });
});


app.get("/contact", function(req, res) {
  res.render("contact", {
    contactsContent: contactContent
  });
});


app.get("/compose", function(req, res) {
  res.render("compose");
});

app.get("/posts/:postId", function(req, res) {
      let requestedPostId =req.params.postId;
      Post.findOne({_id:requestedPostId},function(err,post){
        if (!err) {
          res.render("post",{
            title: post.title,
            content: post.content});
        }
      });
      });

    app.post("/compose", function(req, res) {
      const post = new Post ({
        title: req.body.postTitle,
        content: req.body.postBody

      });
      post.save(function(err){
        if(!err){
            res.redirect("/");
        }
      });
    });


// todolist addon


//create a schema for our collections
const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemSchema); // mongoose model const should be capitalized

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit + to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this check box to delete an item"
});
const defaultItems = [item1, item2, item3];
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const List = mongoose.model("List", listSchema);


app.get("/todolist", function(req, res) {
  List.find({},function(err, foundedLists){
    if(!err){Item.find({}, function(err, foundItems) {

      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("successfully default items are on!");
          }
        });

        res.redirect("/todolist");
      } else {
        let day = date.getDate();
        res.render("todolist", {
          listTitle: day,
          newListItems: foundItems,
          allList:foundedLists
        });
      }
    });}
  });

});


app.get("/todolist/:listName", function(req, res) {

  const listName = _.capitalize(req.params.listName);
  List.find({},function(err,foundedLists){
    if(!err){
      List.findOne({
        name: listName
      }, function(err, foundList) {

        if (!err) {
          if (!foundList) {
            //no list so create a new
            const list = new List({
              name: listName,
              items: defaultItems
            });
            list.save();
            res.redirect("/todolist" + listName);
          } else {
            // show existing list
            res.render("todolist", {
              listTitle: foundList.name,
              newListItems: foundList.items,
              allList:foundedLists
            });
          }
        }
      });
    }
  });

});


app.post("/todolist", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const addedList=req.body.newList;

  const list = new List({
    name: addedList,
    items: defaultItems
  });
  list.save(function(err){
    if(!err){res.redirect("/todolist"+addedList);}
  });

  const item = new Item({
    name: itemName
  });

if(listName === "Today"){
  item.save();
  List.findOneAndUpdate({name: "Today"}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
  });
  res.redirect("/todolist");
}else {
List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/todolist"+listName);
});
}
});

//delete items
app.post("/delete", function(req, res) {
  const itemID = req.body.checkbox;
  const listName= req.body.listName;
  if (listName==="Today"){
    Item.findByIdAndRemove(itemID, function(err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/todolist");
      }
    });
  }
  else {
List.findOneAndUpdate({name:listName},{$pull: {items: {_id:itemID}}}, function(err, foundList){
  if(!err){  res.redirect("/todolist"+listName);}

});
  }
});








//port

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started succefully");
});
