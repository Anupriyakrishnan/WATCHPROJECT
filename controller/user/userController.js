const env = require("dotenv").config();
const User = require("../../models/userSchema")
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer")

const pageNotFound = async (req, res) => {
  try {
    const url = req.originalUrl;
    res.render("404", { requestedUrl: url });
  } catch (error) {
    res.send("Error rendering 404 page");
  }
};

const loadSignup = async(req,res)=>{
  try {
    return res.render("signup")
  } catch (error) {
    res.status(500).send("server error")
  }
}
const loadHomepage = async (req, res) => {
  try {
    const user = req.session.user
    if(user){
      const userData = await User.findOne({_id:user._id})
      res.render("home",{user:userData})
    }else{
      return res.render("Home");
    }
  } catch (error) {
    console.log("Home page is not render");
    res.status(500).send("server error");
  }
};

const loadLogin = async(req,res)=>{
  try {
    return res.render("login")
  } catch (error) {
    res.status(500).send("server error")
  }
}

function generateOtp (){
  return Math.floor(10000 + Math.random()  * 900000).toString()
}

async function sendVerificationEmail(email,otp) {
  try {
    const transporter = nodemailer.createTransport({
      service:'gmail',
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
        user:process.env.NODEMAILER_EMAIL,
        pass:process.env.NODEMAILER_PASSWORD
      }
    })
    const info = await transporter.sendMail({
      from:process.env.NODEMAILER_EMAIL,
      to:email,
      subject:"Verify your account",
      text:`Your OTP is ${otp}`,
      html:`<b> Your otp : ${otp} <\b>`
    })
    return info.accepted.length >0
  } catch (error) {
    console.log("Error sending Email",error)
    return false;
  }
}

const signup = async (req, res) => {
   try {
    const { name, email, phone, password, confirmPassword } = req.body;
    if(password !== confirmPassword){
      return res.render("signup",{message:"password not correct"})
    }
    const findUser = await User.findOne({email})
    if(findUser){
      return res.render("signup",{message:"User already exists"})
    }
    const otp = generateOtp();
    const emailSend = await sendVerificationEmail(email,otp)
      if(!emailSend){
        return res.json("email-error")
      }
      req.session.userOtp = otp;
      req.session.userData = { name, email, phone, password }
      res.json({ status: "success", redirect: "/otpverification" });
      console.log("otp send",otp)
   } catch (error) {
    console.error("signup error",error)
    res.redirect("/pageNotFound")
   }
};

const securePassword = async(password)=>{
  try {
    const passwordHash = await bcrypt.hash(password,10);
    return passwordHash;
  } catch (error) {
    console.error("server error")
  }
}

const verifyOtp = async(req,res)=>{
  try {
    res.render("otpverification")
  } catch (error) {
    console.error("server error")
  }
}
const otpVerification = async (req,res)=>{
  try {
    const {otp} = req.body;
    if(otp === req.session.userOtp){
      const user = req.session.userData;
      const passwordHash = await securePassword(user.password)

      const saveUserData = new User({
        name:user.name,
        email:user.email,
        phone:user.phone,
        password:passwordHash

      })
      await saveUserData.save();
      req.session.user = saveUserData._id;
      res.json({success:true,redirectUrl:"/login"})

    }else{
      res.status(400).json({success:false,message:"invalid otp please try again"})
    }
  } catch (error) {
    res.status(500).json({message: "server error"})
  }
}

const resendOtp = async (req,res)=>{
  try {
    const {email} = req.session.userData
    if(!email){
      return res.status(400).json({success:false , message:"email not found in session"})
    }
    const otp = generateOtp();
    req.session.userOtp = otp;
    const emailSend = await sendVerificationEmail(email,otp)
    if(emailSend){
      console.log("Resend otp:", otp)
      res.status(200).json({success:true,message:"otp resend successfully"})
    }else{
      res.status(500).json({success:false,message:"failed to resendOtp please try again"})
    }
  } catch (error) {
    console.error("Error resending otp",error)
    res.status(500).json({success:false,message:"Internal server error, please try again"})
  }
}

const login = async(req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res.status(400).json({ message: "User not found" });
    }

    if (findUser.isBlocked) {
      return res.status(400).json({ message: "User is blocked by admin" });
    }

    const passwordMatch = await bcrypt.compare(password, findUser.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

   
    
    const userWithoutPassword = {
        _id: findUser._id,
        name: findUser.name,
        email: findUser.email,
        // Add other necessary properties but EXCLUDE password
    };
     req.session.user = userWithoutPassword

    return res.status(200).json({ redirect: "/" });

  } catch (error) {
    console.log("login error", error);
    return res.status(500).json({ message: "Login failed. Try again later" });
  }
};

const logout =async(req,res)=>{
  try {
    req.session.destroy((err)=>{
      if(err){
        return res.redirect("/pageNotFound")
      }
      return res.redirect("/login")
    })
  } catch (error) {
    console.error("server error")
  }
}

module.exports = {
  loadHomepage,
  pageNotFound,
  loadSignup,
  loadLogin,
  signup,
  verifyOtp,
  otpVerification,
  resendOtp,
  login,
  logout,
};
