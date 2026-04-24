const User = require("../models/user");

module.exports.renderSignupForm = (req, resp) => {
  resp.json({message: "Signup form"});
};

module.exports.signupUser = async(req, resp, next) => {
  try{
    let {username, email, password} = req.body.user;
    let newUser = new User({
      username: username,
      email: email,
    });
    await User.register(newUser, password);
    req.login(newUser, (err) => {
      if(err){
        return next(err);
      }
      let redirectUrl = resp.locals.redirectUrl || "/listings";
      resp.json({message: "Welcome to WanderLust", user: newUser, redirectUrl: redirectUrl});
    })
  } catch(err){
    console.log(err);
    resp.status(400).json({error: err.message});
  }
};

module.exports.renderLoginForm = (req, resp) => {
  resp.json({message: "Login form"});
};

module.exports.loginSuccess = async(req, resp) => {
  let redirectUrl = resp.locals.redirectUrl || "/listings";
  resp.json({message: "Welcome Back to WanderLust!", user: req.user, redirectUrl: redirectUrl});
};

module.exports.logoutUser = (req, resp, next) => {
  if(!req.isAuthenticated()){
    return resp.status(400).json({error: "You are already logged out!"});
  }
  req.logout((err) => {
    if(err){
      return next(err);
    }
    resp.json({message: "You logged out successfully!"});
  });
};