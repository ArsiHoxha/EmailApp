const mongoose = require('mongoose');

// List Schema
const listSchema = new mongoose.Schema({
  name: { type: String, required: true },           // List name
  createdAt: { type: Date, default: Date.now }      // Timestamp for list creation
});

// Workspace Schema
const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },           // Workspace name
  imageUrl: { type: String },                       // Optional workspace background image
  createdAt: { type: Date, default: Date.now },     // Timestamp for workspace creation
  lists: [listSchema]                               // Array of lists within the workspace
});

// User Schema with Extended Transactions
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, unique: true },
  profileImage: String,
  imageForHome: { type: String },
  bio: String,
  isAdmin: { type: Boolean, default: false },
  accessToken: String,
  refreshToken: String,

  // Workspaces related to the user
  workspaces: [workspaceSchema],                   

  // Transactions with type and end date tracking
  transactions: [
    {
      date: { type: Date, default: Date.now },      // Transaction date
      amount: { type: Number, required: true },     // Transaction amount
      status: { type: String, default: 'success' }, // Transaction status
      type: {                                      // Transaction type: monthly/yearly
        type: String, 
        enum: ['monthly', 'yearly'], 
        required: true
      },
      endDate: { type: Date, required: true }       // Subscription end date
    }
  ]
});

// Export User Model
const User = mongoose.model('userEmailSaaS', userSchema);

module.exports = User;
