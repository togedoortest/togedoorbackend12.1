const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  title: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  acceptTerms: Boolean,
  role: { type: String, required: true },
  verificationToken: String,
  verified: Date,
  resetToken: {
    token: String,
    expires: Date},
    
isConnected:{
  type : Boolean, default: false 
},
 
  messages: {
    type: Array,
    ref: "Messages",
  },
  conversations: {
    type: Array,
    ref: "Conversations"
  },
    chattingWith:{ type:String ,default: "no"}
     
  

,

 
  picture: {
    type: String,
    required: false,
  },
  userType: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  jobTitle: {
    type: String,
    required: false,
  },
  aboutMe: {
    type: String,
    required: false,
  },
  appliedProjects: {
    type: Array,
    ref: "AppliedProjects",
  },
  favoriteProjects: {
    type: Array,
    ref: "FavoriteProjects",
  },

  passwordReset: Date,
  created: { type: Date, default: Date.now },
  updated: Date
}


);

schema.virtual('isVerified').get(function () {
  return !!(this.verified || this.passwordReset);
});

schema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
    delete ret.passwordHash;
  }
});

module.exports = mongoose.model('Account', schema);