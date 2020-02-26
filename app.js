

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify:false
});
 
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
    name: "Learn mongoDb"
});

const item2 = new Item ({
   name: "Make projects"
});

const item3 =  new Item ({
   name: "Make bigger projects"  
});

const defaultArray = [ item1, item2, item3 ];



const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    
    if(foundItems.length === 0){
      Item.insertMany(defaultArray, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully insreted items to the items collection.");
        }
      });
    }
    else{
  res.render("list", {listTitle: "Today", newListItems: foundItems });
    }});
});



app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List ({
          name: customListName,
          items: defaultArray
        });
        list.save();  
        res.redirect("/" + customListName);
      }else{
        res.render("list", {
          listTitle: customListName,
          newListItems: foundList.items
        });
        
      }
    }
 
  });
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.listName;

   const item = new Item ({
     name: itemName
   });

   if(listName==="Today"){
     item.save()
     res.redirect("/"); 
   }else{
     List.findOne({name: listName}, function(err, foundList){
     foundList.items.push(item);
     foundList.save();
     res.redirect("/" + listName); 
    });
   }
   
});



app.post("/delete", function(req, res){
  const chechedBoxId = req.body.checkbox;
  const listName = req.body.listName;
   
  if(listName === "Today"){
    Item.findByIdAndRemove(chechedBoxId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully removed item.");

      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: { _id: chechedBoxId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
  
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
