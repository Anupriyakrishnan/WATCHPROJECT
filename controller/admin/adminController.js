const User = require("../../models/userSchema")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")



const loadLogin =async(req,res)=>{
    if(req.session.admin){
        return res.redirect("/admin/dashboard")
    }
    res.render("admin-login",{message:null})
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, isAdmin: true });
    if (admin) {
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (passwordMatch) {
        req.session.admin = true;
        return res.redirect("/admin");
      } else {
        return res.redirect("/admin/login");
      }
    } else {
      return res.redirect("/admin/login");
    }
  } catch (error) {
    console.log("login error", error);
    return res.redirect("/pageerror");
  }
};

const loadDashboard = async(req,res)=>{
 if(req.session.admin){
  try {
    res.render("Dashboard")
  } catch (error) {
    res.render("pageerror")
  }
 }
}

const logout = async(req,res)=>{
  try {
    req.session.destroy((err)=>{
      if(err){
        return res.redirect("pageerror")
      }
      return res.redirect("/admin/login")
    })
  } catch (error) {
    console.error("server error")
  }
}


module.exports ={
    loadLogin,
    login,
    loadDashboard,
    logout,
}