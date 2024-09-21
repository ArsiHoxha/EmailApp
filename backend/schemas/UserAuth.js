const mongoose = require('mongoose');

// Define List schema with minimal data
const listSchema = new mongoose.Schema({
  name: { type: String, required: true },        // List name
  createdAt: { type: Date, default: Date.now }   // Timestamp for list creation
});

// Define Workspace schema with list references
const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },        // Workspace name
  imageUrl: { type: String, required: false },   // Workspace background image (optional)
  createdAt: { type: Date, default: Date.now },  // Timestamp for workspace creation
  lists: [listSchema]                            // Array of list names within the workspace
});

// Define User schema
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, unique: true },
  profileImage: String,
  imageForHome: { type: String, required: false },
  bio: String,
  isAdmin: { type: Boolean, default: false },
  accessToken: String,
  refreshToken: String,

  workspaces: [workspaceSchema]  // Array of workspaces for each user
});

const User = mongoose.model('userEmailSaaS', userSchema);

module.exports = User;
