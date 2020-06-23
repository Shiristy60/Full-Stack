var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride =require("method-override");

app = express();

//APP CONFIG
mongoose.connect("mongodb://localhost:27017/studentdb", {useNewUrlParser: true, useUnifiedTopology: true});
app.set("view engine" , "ejs");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

//MONGOOSE/MODEL CONFIG
var studentSchema = new mongoose.Schema({
	Name : String,
	Age : Number,
	Std : Number
});

var Student = mongoose.model("Student", studentSchema);


/*Student.create({
	Name : "Shiristy",
	Age : 21,
	Std: 12
});*/

//RESTFUL ROUTES


app.get("/", function(req, res){
	res.redirect("/students");
})

//INDEX ROUTE
app.get("/students", function(req,res){
	Student.find({}, function(err, students){
		if(err){
			console.log(err)
		}
		else{
			res.render("index", { students: students });
		}
	})
})

//NEW ROUTE
app.get("/students/new", function(req,res){
	res.render("new");
})

//CREATE ROUTE
app.post("/students", function(req, res){
	//create students
	Student.create(req.body.student, function(err, newStudent){
		if(err){
			res.render("new")
		}
		else{
			res.redirect("students");
		}
	})
})	

//SHOW PAGE
app.get("/students/:id", function(req,res){
	Student.findById(req.params.id, function(err, foundStudent){
		if(err){
			res.redirect("/students");
		}
		else{
			res.render("show", {student: foundStudent});
		}
	})
	
})

//EDIT ROUTE
app.get("/students/:id/edit", function(req, res){
	Student.findById(req.params.id, function(err, foundStudent){
		if(err){
			res.redirect("/students");
		}
		else{
			res.render("edit", {student: foundStudent});
		}
	})
})

//UPDATE ROUTE
app.put("/students/:id", function(req, res){
	Student.findByIdAndUpdate(req.params.id, req.body.student, function(err, updatedStudent){
		if(err){
			res.redirect("/students");
		}
		else{
			res.redirect("/students/");
		}
	})
})

//DELETE ROUTE
app.delete("/students/:id", function(req, res){
	//destro student
	Student.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/students");
		}
		else{
			res.redirect("/students");
		}
	})
})

app.listen(4000, function(){
	console.log("SERVER IS RUNNING");
})