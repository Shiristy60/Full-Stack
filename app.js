var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride =require("method-override");
var moment = require("moment");

app = express();

//APP CONFIG
mongoose.connect("mongodb://localhost:27017/surveydb", {useNewUrlParser: true, useUnifiedTopology: true});
app.set("view engine" , "ejs");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

app.locals.moment=require('moment');

//MONGOOSE/MODEL CONFIG
var userSchema = new mongoose.Schema({
	FirstName : String,
	LastName: String,
	Comment: String,
	createdAt: { type: Date, default: Date.now }
});

var User= mongoose.model("User", userSchema);


/*Student.create({
	Name : "Shiristy",
	Age : 21,
	Std: 12
});*/

//RESTFUL ROUTES


app.get("/", function(req, res){
	res.redirect("/users");
})

//INDEX ROUTE
app.get("/users", function(req,res){
	User.find({}, function(err, users){
		if(err){
			console.log(err)
		}
		else{
			res.render("index", { users: users });
		}
	})
})

//NEW ROUTE
app.get("/users/new", function(req,res){
	res.render("new");
})

//CREATE ROUTE
app.post("/users", function(req, res){
	//create students
	User.create(req.body.user, function(err, newUser){
		if(err){
			res.render("new")
		}
		else{
			res.redirect("users");
		}
	})
})	

//SHOW PAGE
app.get("/users/:id", function(req,res){
	User.findById(req.params.id, function(err, foundUser){
		if(err){
			res.redirect("/users");
		}
		else{
			res.render("show", {user: foundUser});
		}
	})
	
})

//EDIT ROUTE
app.get("/users/:id/edit", function(req, res){
	User.findById(req.params.id, function(err, foundUser){
		if(err){
			res.redirect("/users");
		}
		else{
			res.render("edit", {user: foundUser});
		}
	})
})

//UPDATE ROUTE
app.put("/users/:id", function(req, res){
	User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser){
		if(err){
			res.redirect("/users");
		}
		else{
			res.redirect("/users/");
		}
	})
})

//DELETE ROUTE
app.delete("/users/:id", function(req, res){
	//destroy user
	User.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/users");
		}
		else{
			res.redirect("/users");
		}
	})
})

app.listen(4000, function(){
	console.log("SERVER IS RUNNING");
})