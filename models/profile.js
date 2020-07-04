var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var profileSchema =  new mongoose.Schema({
	username: String,
	password: String
});

profileSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("Profile", profileSchema);