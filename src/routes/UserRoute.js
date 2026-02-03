// // src/routes/auth.route.js
// var { login, register, createUserByAdmin, getUserDetails, getAllUsers, updateUser, deleteUser, sendOTP, verifyOtp, resetPassword, getCurrentUser, getUserPermissions } = require("../controllers/UserController");
// const auth = require("../middlewares/auth.middleware");
// const user = (app)=>{
// app.get("/api/user",auth.validate_token(), getAllUsers);
// app.post("/api/user", auth.validate_token(), createUserByAdmin); // Create new user (admin only)
// app.post("/login", login);
// app.post("/api/user/sendOtp", sendOTP);
// app.post("/api/user/verifyOtp", verifyOtp);
// app.post("/api/user/resetPassword", resetPassword);
// app.post("/register", register);
// app.get("/api/user/me", auth.validate_token(), getCurrentUser); // Get current logged-in user
// app.get("/api/user/permissions", auth.validate_token(), getUserPermissions); // Get user permissions
// app.get("/api/user/:id",  auth.validate_token() ,getUserDetails);
// app.put("/api/user/:id", auth.validate_token() ,updateUser);
// app.delete("/api/user/:id", auth.validate_token() ,deleteUser);

// // Add missing endpoints for frontend compatibility
// app.patch("/api/users/:id/password", auth.validate_token(), updateUser); // Password change
// app.patch("/api/users/:id/status", auth.validate_token(), updateUser); // Status change
// }

// module.exports = user;

// routes/auth.route.js
const auth = require("../middlewares/auth.middleware");
const {
  login,
  register,
  sendOTP,
  verifyOtp,
  resetPassword,
  getAllUsers,
  getCurrentUser,
  getUserPermissions,
  getUserDetails,
  updateUser,
  deleteUser,
} = require("../controllers/UserController");

module.exports = (app) => {
  app.post("/login", login);
  app.post("/register", register);

  // 🔓 PUBLIC
  app.post("/api/user/sendOtp", sendOTP);
  app.post("/api/user/verifyOtp", verifyOtp);
  app.post("/api/user/resetPassword", resetPassword);

  // 🔒 PROTECTED
  app.get("/api/user", auth.validate_token(), getAllUsers);
  app.get("/api/user/me", auth.validate_token(), getCurrentUser);
  app.get("/api/user/permissions", auth.validate_token(), getUserPermissions);
  app.get("/api/user/:id", auth.validate_token(), getUserDetails);
  app.put("/api/user/:id", auth.validate_token(), updateUser);
  app.delete("/api/user/:id", auth.validate_token(), deleteUser);
};
