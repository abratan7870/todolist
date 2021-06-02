//jshint esversion:6
const express=require("express");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app=express();

app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://abratan:test123@cluster0.vr3pi.mongodb.net/TodoListdb",{ useNewUrlParser: true,useUnifiedTopology: true });

const itemsSchema={
  name:String
};

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to your todolist:"
});
const item2=new Item({
  name:"Hit + button to add more items"
});
const item3=new Item({
  name:"Click submit button to save "
});

const defaultitems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);


app.get("/",function(req,res){
Item.find({},function(err,foundItems){

  if(foundItems.length===0)
  {
    Item.insertMany(defaultitems,function(err){
      if(err)
      {
        console.log(err);
      }
      else{
        console.log("Success")
      }

    });
    res.redirect("/");
  }
  else
  {
    res.render("list",{listTitle:"Today",newlistitems:foundItems});

  }

});

});

app.get("/:customListName",function(req,res){
const customListName=_.capitalize(req.params.customListName);

List.findOne({name:customListName},function(err,foundList){
  if(!err)
  { if(!foundList){
    const list=new List({
      name:customListName,
      items:defaultitems
    });     // create a new item or console.log("Does not exist already");
  list.save();
  res.redirect("/"+customListName);
}
  else{
  res.render("list",{listTitle: foundList.name, newlistitems:foundList.items}); //Show an existing list console.log("Already exists");
  }
  }
});



});

app.post("/",function(req,res){
  const itemName=req.body.newitem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else {
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete",function(req,res){
const checkedItemId=req.body.checkbox;
const listName=req.body.listName;

if(listName==="Today"){
Item.findByIdAndRemove(checkedItemId,function(err){
  if(!err){
    console.log("Successfully deleted");
    res.redirect("/");
  }
});
}
else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
    if(!err)
    {
      res.redirect("/"+listName);
    }
  });
}
});

let port=process.env.PORT;
if(port===null || port=== ""){
  port=3000;
}
app.listen(port,function(){
  console.log("Server started ");

});
