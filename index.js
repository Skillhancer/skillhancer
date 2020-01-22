var express =require("express");
var bodyparser=require("body-parser");
var path=require("path");
var multer=require('multer');
app = express();
var mongoose = require('mongoose');
var keys = require('./config/keys')
const authRoutes = require('./routes/auth-routes');
const mainpageRoutes = require('./routes/mainpage');
const coreRoutes = require('./routes/core');
const adminRoutes = require('./routes/adminpanel');
const admin = require('firebase-admin');

const passportSetup = require('./config/passport-setup');
const passport = require('passport')
const cookieSession = require('cookie-session')
var port = process.env.PORT || 3000;
mongoose.connect(keys.monodbURL.dbURL,()=>{
  console.log('connected To database')
})

//session
app.use(cookieSession({
  maxAge:24*60*60*1000,
  keys:[keys.session.cookieKey]
}))
//initializing passport
app.use(passport.initialize());
app.use(passport.session());


//inittializations
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/public/'));

//setting up[ middleweare]
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'/public/')));

//starting file idex.ejs
app.get('/',(req,res)=>{
  if(req.user)
  {
    res.render('mainpage');
  }
  else
  {
    res.render('index');
  }
  
})

//setting up auth routes
app.use('/auth',authRoutes)

//setting up mainpage routes
app.use('/mainpage',mainpageRoutes)

//setting up teacher main page route
app.use('/core',coreRoutes)

//setting up teacher main page route
app.use('/adminpanel',adminRoutes)

//Getting mainpage.ejs page
app.get('/giveMainpage',(req,res)=>{
  res.render('mainpage')
})

//upload page
app.get('/upload',(req,res)=>{
  res.render('upload');
})

//Getting profile.ejs page
app.get('/giveProfilepage',(req,res)=>{
  res.render('profile');
})

//Getting myprofile.ejs page
app.get('/giveMyProfilepage',(req,res)=>{
  res.render('myprofile');
})

//Getting sharedProfile.ejs page
app.get('/giveSharedProfilepage',(req,res)=>{
  res.render('sharedProfile');
})

//Getting Index.ejs page
app.get('/giveIndexpage',(req,res)=>
{
  res.render('index')
});

//getting inapropriate.ejs
app.get('/giveInappropriate',(req,res)=>{
  res.render('inapropriate')
})

//privacy policy
app.get('/privacypolicy',(req,res)=>{
  res.render('privacy_policy')
})

//listening
app.listen(port,function(req,res){
  console.log('turned on 3000');
})