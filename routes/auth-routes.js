const router = require('express').Router();
const passport = require('passport');


//auth login 
router.get('/google',passport.authenticate('google',{
    scope:['profile','email']
}));

//callback url from google
router.get('/google/redirect',passport.authenticate('google'),(req,res)=>{
    console.log("this is in auth rout:",req.user.mail)
    res.redirect('/mainpage')
})

router.get('/login',(req,res)=>{
    res.redirect('/giveIndexpage')
})

//auth logout
router.get('/logout',(req,res)=>{
    //handle with passport
    req.logout();
    res.redirect('/giveIndexpage')
})


module.exports = router;