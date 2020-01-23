const router = require('express').Router();
const multer=require('multer');
const path=require("path");
const fs = require('fs')
const Video = require('../models/video')
const User = require('../models/user-models')
const Gvideo = require('../models/graded-video')
const Pvideo = require('../models/peergraded-video')
const References = require('../models/references')
const admin = require('firebase-admin')
const serviceAccount = require('./preskiletprofessional-firebase-adminsdk-n9blw-61ade7872c.json')
admin.initializeApp({
    credential:admin.credential.cert(serviceAccount),
    storageBucket: "gs://preskiletprofessional.appspot.com"
})
const bucket = admin.storage().bucket()


const authcheck = (req,res,next)=>{
    if(!req.user)
    {
        res.redirect('/auth/login')
    }
    else
    {
        next();
    }
}


router.get('/',authcheck,(req,res)=>{
    res.redirect("/giveMainpage");
})


//ajax call onload of mainpage
router.get('/givevideo',(req,res)=>{
    const para=[];
    var flag = 0;
    References.findOne({'uid':'123'}).then((ref)=>{
        console.log("This is details",ref.mails)
        console.log("current user:",req.user.mail)
        var arr = ref.mails;
        for(let i=0;i<arr.length;i++)
        {
            console.log("array elements:",arr[i])
            if(arr[i] == req.user.mail)
            {
                flag=1;
                console.log("flag is:",flag)
            }
        }

        if(flag == 1)
        {
            console.log("Current user mail",req.user.mail)
            console.log(req.user.mail)
            Gvideo.distinct("path",{grader_mail:req.user.mail}).then((videoPath)=>{
                Video.find({$and:[{path:{$nin:videoPath}},{path:{$nin:req.user.inapropriate}},{mail:{$ne:req.user.mail}}]}).then((NGvideo)=>{
                    console.log("path are:",videoPath)
                    Video.find({$and:[{path:{$in:videoPath}},{mail:{$ne:req.user.mail}}]}).then((Gvideo)=>{
                        console.log("Graded:",Gvideo)
                        res.send({"video":NGvideo,"gvideo":Gvideo})
                    })
                    
                })
            })
        }
        else
        {
            console.log("Current user mail",req.user.mail)
            console.log(req.user.mail)
            Pvideo.distinct("path",{grader_mail:req.user.mail}).then((videoPath)=>{
                Video.find({$and:[{path:{$nin:videoPath}},{path:{$nin:req.user.inapropriate}},{mail:{$ne:req.user.mail}}]}).then((NGvideo)=>{
                    console.log("path are:",videoPath)
                    Video.find({$and:[{path:{$in:videoPath}},{mail:{$ne:req.user.mail}}]}).then((Gvideo)=>{
                        console.log("Graded:",Gvideo)
                        res.send({"video":NGvideo,"gvideo":Gvideo})
                    })
                    
                })
            })
        }
    })
})


//Module For Uploading Videos Starts here 
router.post('/uploadproject',(req,res)=>{
    
    //multer initialization
    var storage2 = multer.diskStorage({
        destination:'./public/uploads/videos/',
        filename: function(req, file, cb) 
        {
        cb(null, file.fieldname + '-' + Date.now() +path.extname(file.originalname));
        }
    });
    var upload2 = multer({ storage: storage2 }).single('user_uploaded_video');
    
    //upload video
    var videopath;
    upload2(req,res,function(err){
        var name = './public/uploads/videos/'+req.file.filename
        console.log("name of file:",name)
        var gname = req.file.filename
        const options = {
            resumable: false,
          };
        bucket.upload(name,options,function(err, file, apiResponse) {
            console.log('inside Error:',err)
            console.log('inside File:',file)
            console.log('inside response:',apiResponse)
            

            
            const f = bucket.file(gname)
            f.makePublic().then(function(data) {
            
              const apiResponse = data[0];
              console.log("This is apiResponse:",apiResponse)
              console.log("This is data:",data)
              f.getMetadata().then(function(data) {
                const metadata = data[0];
                const apiResponse = data[1];
                console.log("This is metadata:",metadata.mediaLink)
                console.log("This is LAst PI:",apiResponse)

                new Video({
                    mail : req.user.mail,
                    name : req.user.name,
                    title : req.body.title,
                    description : req.body.description,
                    path : metadata.mediaLink,
                    vname:gname,
                    avgeye : 0,
                    avgvoice : 0,
                    avgconfidence : 0,
                    avgknowledge : 0,
                    peeravgeye : 0,
                    peeravgvoice : 0,
                    peeravgconfidence : 0,
                    peeravgknowledge : 0,
                    inapropriate_count:0,
                    
                }).save().then((newVideo)=>{
                    console.log('new video:',newVideo);
                    res.redirect('/giveMyProfilepage'); 
                });
               
              });
            });

        });
        
    });
})

//Module For Uploading Videos Ends here 



// module for search query starts here

router.get('/search',(req,res)=>{
    const para=[];
    var flag =0;
    References.findOne({'uid':'123'}).then((ref)=>{
        console.log("This is details",ref.mails)
        console.log("current user:",req.user.mail)
        var arr = ref.mails;
        for(let i=0;i<arr.length;i++)
        {
            console.log("array elements:",arr[i])
            if(arr[i] == req.user.mail)
            {
                flag=1;
                console.log("flag is:",flag)
            }
        }
        
        console.log("search parameter is:",req.query.searchval)
        if(req.query.searchval=="")
        {
            if(flag == 1)
            {
                Gvideo.distinct("path",{grader_mail:req.user.mail}).then((videoPath)=>{
                    Video.find({$and:[{path:{$nin:videoPath}},{path:{$nin:req.user.inapropriate}},{mail:{$ne:req.user.mail}}]}).then((NGvideo)=>{
                        console.log("path are:",videoPath)
                        Video.find({$and:[{path:{$in:videoPath}},{mail:{$ne:req.user.mail}}]}).then((Gvideo)=>{
                            console.log("Graded:",Gvideo)
                            res.send({"video":NGvideo,"gvideo":Gvideo})
                        })
                    })
                })
            }
            else
            {
                Pvideo.distinct("path",{grader_mail:req.user.mail}).then((videoPath)=>{
                    Video.find({$and:[{path:{$nin:videoPath}},{path:{$nin:req.user.inapropriate}},{mail:{$ne:req.user.mail}}]}).then((NGvideo)=>{
                        console.log("path are:",videoPath)
                        Video.find({$and:[{path:{$in:videoPath}},{mail:{$ne:req.user.mail}}]}).then((Gvideo)=>{
                            console.log("Graded:",Gvideo)
                            res.send({"video":NGvideo,"gvideo":Gvideo})
                        })
                    })
                })
            }

        }else
        {
            if(flag == 1)
            {
                Gvideo.distinct("path",{grader_mail:req.user.mail}).then((videoPath)=>{
                    Video.find({$and:[{path:{$nin:videoPath}},{path:{$nin:req.user.inapropriate}},{mail:{$ne:req.user.mail}},{$or:[{mail:{ $regex: '.*' + req.query.searchval + '.*' }},{name:{ $regex: '.*' + req.query.searchval + '.*' }},{seat:{ $regex: '.*' + req.query.searchval + '.*' }},{title:{ $regex: '.*' + req.query.searchval + '.*' }}]}]}).then((NGvideo)=>{
                        console.log("path are:",videoPath)
                        Video.find({$and:[{path:{$in:videoPath}},{mail:{$ne:req.user.mail}},{$or:[{mail:{ $regex: '.*' + req.query.searchval + '.*' }},{name:{ $regex: '.*' + req.query.searchval + '.*' }},{seat:{ $regex: '.*' + req.query.searchval + '.*' }},{title:{ $regex: '.*' + req.query.searchval + '.*' }}]}]}).then((Gvideo)=>{
                            console.log("Graded:",Gvideo)
                            res.send({"video":NGvideo,"gvideo":Gvideo})
                        })
                    })
                })
            }
            else
            {
                Pvideo.distinct("path",{grader_mail:req.user.mail}).then((videoPath)=>{
                    Video.find({$and:[{path:{$nin:videoPath}},{path:{$nin:req.user.inapropriate}},{mail:{$ne:req.user.mail}},{$or:[{mail:{ $regex: '.*' + req.query.searchval + '.*' }},{name:{ $regex: '.*' + req.query.searchval + '.*' }},{seat:{ $regex: '.*' + req.query.searchval + '.*' }},{title:{ $regex: '.*' + req.query.searchval + '.*' }}]}]}).then((NGvideo)=>{
                        console.log("path are:",videoPath)
                        Video.find({$and:[{path:{$in:videoPath}},{mail:{$ne:req.user.mail}},{$or:[{mail:{ $regex: '.*' + req.query.searchval + '.*' }},{name:{ $regex: '.*' + req.query.searchval + '.*' }},{seat:{ $regex: '.*' + req.query.searchval + '.*' }},{title:{ $regex: '.*' + req.query.searchval + '.*' }}]}]}).then((Gvideo)=>{
                            console.log("Graded:",Gvideo)
                            res.send({"video":NGvideo,"gvideo":Gvideo})
                        })
                    })
                })
            }


        }
    
    })
    
    
})

// module for search query ends here 


//module for getting the profile on click begins
var clickedmail1;
var flag;
//1.get clicked mail
router.get('/profile',(req,res)=>{
    if(req.query.pmail == undefined)
    {
        var passedmail = req.url
        console.log("this is passed mail:",passedmail)
        passedmail = passedmail.split('=')
        passedmail = passedmail[1]
        passedmail = passedmail.replace('%40',"@")
        res.redirect('/giveProfilepage?sharedmail='+passedmail);
    }
    else
    {
        console.log("this is href :",req.query.pmail)
        clickedmail1 = req.query.pmail;
        res.redirect('/giveProfilepage?sharedmail='+clickedmail1);
    }
})

//2.ajax call onload of clicked profile
router.get('/getDetails',(req,res)=>{
    var clickedmail = req.url
    clickedmail = clickedmail.split('=')
    clickedmail = clickedmail[1]
    clickedmail = clickedmail.replace('%40',"@")
    console.log("this is eemail :",clickedmail)
    var flag2 = 0;
    References.findOne({'uid':'123'}).then((ref)=>{
        console.log("This is details",ref.mails)
        console.log("current user:",req.user.mail)
        var arr = ref.mails;
        for(let i=0;i<arr.length;i++)
        {
            console.log("array elements:",arr[i])
            if(arr[i] == req.user.mail)
            {
                flag2=1;
                console.log("flag is:",flag)
            }
        }
        if(flag2 == 1)
        {
            Gvideo.distinct("path",{grader_mail:req.user.mail}).then((videoPath)=>{
                Video.find({$and:[{path:{$nin:videoPath}},{path:{$nin:req.user.inapropriate}},{mail:clickedmail}]}).then((NGvideo)=>{
                    console.log("path are:",videoPath)
                    Video.find({$and:[{path:{$in:videoPath}},{mail:clickedmail}]}).then((Gvideo)=>{
                        User.findOne({mail:clickedmail}).then((clickedUser)=>{
                            if(clickedmail == req.user.mail)
                            {
                                flag = 1
                            }
                            else
                            {
                                flag = 0
                            }
                            res.send({"user":clickedUser,"video":NGvideo,"gvideo":Gvideo,"flag":flag})
                        })
                    })
                })
            })
        }
        else
        {
            Pvideo.distinct("path",{grader_mail:req.user.mail}).then((videoPath)=>{
                Video.find({$and:[{path:{$nin:videoPath}},{path:{$nin:req.user.inapropriate}},{mail:clickedmail}]}).then((NGvideo)=>{
                    console.log("path are:",videoPath)
                    Video.find({$and:[{path:{$in:videoPath}},{mail:clickedmail}]}).then((Gvideo)=>{
                        User.findOne({mail:clickedmail}).then((clickedUser)=>{
                            if(clickedmail == req.user.mail)
                            {
                                flag = 1
                            }
                            else
                            {
                                flag = 0
                            }
                            res.send({"user":clickedUser,"video":NGvideo,"gvideo":Gvideo,"flag":flag})
                        })
                    })
                })
            })
        }
        
    })
    
})
//module for getting the profile on click ends


//module for getting the profile 

//1.give myprofile.ejs
router.get('/myprofile',(req,res)=>{
    res.redirect('/giveMyProfilepage');
})

//2.fillup myprofile.ejs
router.get('/getMyDetails',(req,res)=>{
    var para = [];
    console.log("this is CurrentMail :",req.user.mail)
    User.findOne({mail:req.user.mail}).then((clickedUser)=>{
        console.log("This is USerData:",clickedUser)
        Video.find({mail:req.user.mail}).then((videos)=>{
            console.log("This is USerVideos:",videos)
            res.send({"user":clickedUser,"video":videos})
        })
    })    
})
//module for getting the profile ends


//module for getting shared profile


//1.get sharedProfile Page
router.get('/sharedProfile',(req,res)=>{
    var sharedMail;
    sharedMail = req.query.mail
    console.log('This is user:',req.user)
    if(req.user)
    {
        res.redirect('/mainpage/profile?sharedmail='+sharedMail);
    }
    else
    {
        res.redirect('/giveSharedProfilepage?sharedmail='+sharedMail);    
    }
})

//2.fill up sharedProfile Page
router.get('/getSharedDetails',(req,res)=>{
    var para = [];
    var sharedMail = req.url
    sharedMail = sharedMail.split('=')
    sharedMail = sharedMail[1]
    sharedMail = sharedMail.replace('%40',"@")
    console.log("this is eemail :",sharedMail)
    User.findOne({mail:sharedMail}).then((clickedUser)=>{
        console.log("This is USerData:",clickedUser)
        Video.find({mail:sharedMail}).then((videos)=>{
            console.log("This is USerVideos:",videos)
            res.send({"user":clickedUser,"video":videos})
        })
    })    
})

//module for getting shared profile ends


//module for removing the video

router.get('/remove',(req,res)=>{
    console.log("This is path:",req.query)
    var video_name = req.query.vid_name
    var vpath = req.query.vid_path
   
    
    //1)delete from bucket
    const file = bucket.file(video_name);
    
    file.delete().then(function(data) {
        
        //2)delete from database:
        Video.deleteOne({vname:video_name}).then((vids)=>{
            Gvideo.deleteMany({$and:[{mail:req.user.mail},{path:vpath}]}).then((dvids)=>{
                //3)update user collection
                
                Video.find({mail:req.user.mail}).then((records)=>{
                    if(records.length)
                    {
                        console.log("in if:")
                        Video.aggregate(
                            [
                            {
                                $group:
                                {
                                    _id: "$mail",
                                    avgEye: { $avg: "$avgeye" },
                                    avgVoice: { $avg: "$avgvoice" },
                                    avgConfidence: { $avg: "$avgconfidence" },
                                    avgKnowledge: { $avg: "$avgknowledge" },
                                }
                            }
                            ]
                        ).then((avgUser)=>{
                            
                            var ctr;
                            for(let i =0;i<avgUser.length;i++)
                            {
                                if(avgUser[i]._id==req.user.mail)
                                {
                                    ctr = i;
                                }
                                console.log("This is Id=",avgUser[i]._id)
                            }
                            query = { mail: req.user.mail};
                            User.updateOne(query,{$set:{avgeye:parseInt(avgUser[ctr].avgEye, 10),avgvoice:parseInt(avgUser[ctr].avgVoice, 10),avgconfidence:parseInt(avgUser[ctr].avgConfidence, 10),avgknowledge:parseInt(avgUser[ctr].avgKnowledge, 10)}}).then((userInfo=>{
                                console.log('this is users :',userInfo)
                                User.findOne({mail:req.user.mail}).then((userDetails)=>{
                                    var favg = userDetails.avgeye+userDetails.avgvoice+userDetails.avgconfidence+userDetails.avgknowledge
                                    favg = favg/4;
                                    console.log(favg)
                                    User.updateOne(query,{$set:{avgall:parseInt(favg, 10)}}).then((Finaluser)=>{
                                        User.find({mail:req.user.mail}).then((updatedUser)=>{
                                            res.send({"user":updatedUser})
                                        })
                                    })
                                })
                            }))
                        })
                    }
                    else
                    {
                        console.log("in else:")
                        User.updateOne({mail:req.user.mail},{$set:{avgeye:0,avgvoice:0,avgconfidence:0,avgknowledge:0,avgall:0}}).then((updatedUser)=>{
                            User.find({mail:req.user.mail}).then((updatedUser)=>{
                                res.send({"user":updatedUser})
                            })
                        })
                    }
                })
            })
        })
   
    });
})

//module for removing the video ends 


module.exports = router;