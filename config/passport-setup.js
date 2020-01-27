const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const keys = require('./keys')
const User = require('../models/user-models')


var flag;

passport.serializeUser((user,done)=>{
    done(null,user.id);
})

passport.deserializeUser((id,done)=>{
    
    User.findById(id).then((user)=>{
        done(null,user);
    })
})


passport.use(
    new GoogleStrategy({
        //options for google
        callbackURL:'https://preskilet.herokuapp.com/auth/google/redirect',
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    },(accessToken,refreshToken,profile,done)=>{
        
        //passport callback function
        console.log(profile.emails[0].value)
        
        //check if it is new student or existing student
        User.findOne({googleId:profile.id}).then((currentUser)=>{
            if(currentUser)
            {
                //retrive user exist already
                console.log('already user :',currentUser);
                done(null,currentUser);
            }
            else
            {
                //new user
                new User({
                    name : profile.displayName,
                    googleId : profile.id,
                    mail : profile.emails[0].value,
                    ipath : profile.photos[0].value,
                    intropath : 'na', 
                    ppath:'na',
                    avgeye : 0,
                    avgvoice : 0,
                    avgconfidence : 0,
                    avgknowledge : 0,
                    avgall : 0,
                    peeravgeye : 0,
                    peeravgvoice : 0,
                    peeravgconfidence : 0,
                    peeravgknowledge : 0,
                    peeravgall : 0,
                    gradecount : 0
                }).save().then((newUser)=>{
                    console.log('new user:',newUser);
                    done(null,newUser);
                });
            }
        })
        
    })


)