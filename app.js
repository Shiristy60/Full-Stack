var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride =require("method-override");
var moment = require("moment");
var flash=require("connect-flash");
var Profile=require("./models/profile");

app = express();

//APP CONFIG
mongoose.connect("mongodb+srv://shiristy:yelpcamp@cluster0-ibvyr.mongodb.net/<dbname>?retryWrites=true&w=majority", {
	useNewUrlParser: true,
	useCreateIndex: true
}).then(()=> {
	console.log("Connected to DB");
}).catch(err => {
	Console.log("ERROR: ", err.message);
})


app.set("view engine" , "ejs");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash()); 

app.locals.moment=require('moment');

//MONGOOSE/MODEL CONFIG
var userSchema = new mongoose.Schema({
	FirstName : String,
	LastName: String,
	Comment: String,
	createdAt: { type: Date, default: Date.now },
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Profile"
		},
		username: String
	}
});

var User= mongoose.model("User", userSchema);

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "LoginSuccessful",
	resave: false,
	saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Profile.authenticate()))

passport.serializeUser(Profile.serializeUser());
passport.deserializeUser(Profile.deserializeUser());

//passing currentuser to every route
app.use(function(req,res, next){
	res.locals.currentUser = req.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();//next action that should be performed, basically route handler
})


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
			res.render("index", { users: users, currentUser:req.user });
		}
	})
})

//NEW ROUTE
app.get("/users/new", isLoggedIn, function(req,res){
	res.render("new"); 
})

//CREATE ROUTE
app.post("/users", isLoggedIn, function(req, res){
	//create students
	var fname=req.body.FirstName;
	var lname=req.body.LastName;
	var comment=req.body.Comment;
	var date=req.body.createdAt;
	var author= {
		id: req.user._id,
		username: req.user.username
	}
	var newUser = {FirstName: fname, LastName: lname, Comment: comment, createdAt: date, author: author}
	
	User.create(newUser, function(err, newlyCreatedUser){
		if(err){
			res.render("new")
		}
		else{
			res.redirect("users");
			console.log(newlyCreatedUser);
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
			res.render("show", {user: foundUser, currentUser:req.user});
			console.log(req.user);
		}
	})
})

//EDIT ROUTE
app.get("/users/:id/edit", checkOwnership, function(req, res){
	User.findById(req.params.id, function(err, foundUser){
		res.render("edit", {user: foundUser});
	});
})

//UPDATE ROUTE
app.put("/users/:id", checkOwnership, function(req, res){
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
app.delete("/users/:id", checkOwnership, function(req, res){
	//destroy user
	User.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/users");
		}
		else{
			res.redirect("/users");
		}
	})
})//AUTH ROUTES
app.get("/register", function(req, res){
	res.render("register");
})

//SIGN UP LOGIC
app.post("/register", function(req, res){
	var newProfile=new Profile({username: req.body.username});
	Profile.register(newProfile, req.body.password, function(err, user){
		if(err){
			req.flash("error", err.message);
			return res.redirect("register");
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome "+ user.username)
			res.redirect("/users");
		});
	})
})

//LOGIN FORM
app.get("/login", function(req, res){
	res.render("login");
})

//LOGIN LOGIC
app.post("/login", passport.authenticate("local", {
	successRedirect: "/users",
	failureRedirect: "/login"
	}), function(req, res){
})

//LOGOUT
app.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged You Out!");
	res.redirect("/users");
})

//middleware
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "Please Login First")
	res.redirect("/login");
}

function checkOwnership(req, res, next){
	if(req.isAuthenticated()){
		User.findById(req.params.id, function(err, foundUser){
			if(err){
				res.redirect("back");
			}
			else{
				//does the user have permission?
				//foundUser.author.id is an object
				if((foundUser.author.id).equals(req.user._id) ){
					next();
				}
				else{
					req.flash("error", "You don't have permission to do that");
					res.redirect("back");
				}
			}
		})
		
	}else{
		req.flash("error", "You need to be logged in to do that");
		res.redirect("back");
	}
}

app.listen(4000, function(){
	console.log("SERVER IS RUNNING");
})