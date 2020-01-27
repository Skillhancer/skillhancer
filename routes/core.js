const router = require('express').Router();
const Video = require('../models/video')
const User = require('../models/user-models')
const Gvideo = require('../models/graded-video')
const References = require('../models/references')
const Pvideo = require('../models/peergraded-video')
const multer=require('multer');
const path=require("path");
const admin = require('firebase-admin')
const serviceAccount = require('./preskiletprofessional-firebase-adminsdk-n9blw-61ade7872c.json')
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

//Ajax Response to Grade 
router.get('/gradestd',(req,res)=>{
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
            console.log('Iam a teacher')
            console.log("This is voice:",parseInt(req.query.voice, 10))
            User.updateOne({mail:req.user.mail},{$inc:{gradecount:1}}).then((cupdate)=>{
                Video.findOne({path:req.query.path}).then((userMail)=>{
                    new Gvideo({
                        mail:userMail.mail,
                        grader_mail:req.user.mail,
                        path:req.query.path,
                        eye : parseInt(req.query.eye, 10),
                        voice : parseInt(req.query.voice, 10),
                        confidence : parseInt(req.query.confidence, 10),
                        knowledge : parseInt(req.query.knowledge, 10),
                    }).save().then((newUser)=>{
                        console.log('new user:',newUser);
                        Gvideo.aggregate(
                            [
                            {
                                $group:
                                {
                                    _id: "$path",
                                    avgEye: { $avg: "$eye" },
                                    avgVoice: { $avg: "$voice" },
                                    avgConfidence: { $avg: "$confidence" },
                                    avgKnowledge: { $avg: "$knowledge" },
                                }
                            }
                            ]
                        ).then((avgValues)=>{
                            var str = req.query.path
                            var str2 = str.toString(str)
                            var query = { path: str2 };
                            Video.updateOne(query,{$set:{avgeye:parseInt(avgValues[0].avgEye, 10),avgvoice:parseInt(avgValues[0].avgVoice, 10),avgconfidence:parseInt(avgValues[0].avgConfidence, 10),avgknowledge:parseInt(avgValues[0].avgKnowledge, 10)}}).then((updateds)=>{
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
                                        if(avgUser[i]._id==userMail.mail)
                                        {
                                            ctr = i;
                                        }
                                        console.log("This is Id=",avgUser[i]._id)
                                    }
                                    query = { mail: userMail.mail };
                                    console.log(parseInt(avgUser[ctr].avgEye,10))
                                    User.updateOne(query,{$set:{avgeye:parseInt(avgUser[ctr].avgEye, 10),avgvoice:parseInt(avgUser[ctr].avgVoice, 10),avgconfidence:parseInt(avgUser[ctr].avgConfidence, 10),avgknowledge:parseInt(avgUser[ctr].avgKnowledge, 10)}}).then((userInfo=>{
                                        console.log('this is users :',userInfo)
                                        User.findOne({mail:userMail.mail}).then((userDetails)=>{
                                            var favg = userDetails.avgeye+userDetails.avgvoice+userDetails.avgconfidence+userDetails.avgknowledge
                                            favg = favg/4;
                                            console.log(favg)
                                            User.updateOne(query,{$set:{avgall:parseInt(favg, 10)}}).then((Finaluser)=>{
                                                console.log('Updated User:',Finaluser)
                                                Video.find({path:req.query.path}).then((updatedvideo)=>{
                                                    console.log("This is original path:",req.query.path)
                                                    res.send({"video":updatedvideo})
                                                })
                                                
                                            })
                                        })
                                    }))
                                })
                            })
                        })
                    });
                })
            })
            
        }
        else
        {
            console.log('Iam a student')
            console.log("This is voice:",parseInt(req.query.voice, 10))
            User.updateOne({mail:req.user.mail},{$inc:{gradecount:1}}).then((cupdate)=>{
                Video.findOne({path:req.query.path}).then((userMail)=>{
                    new Pvideo({
                        mail:userMail.mail,
                        grader_mail:req.user.mail,
                        path:req.query.path,
                        eye : parseInt(req.query.eye, 10),
                        voice : parseInt(req.query.voice, 10),
                        confidence : parseInt(req.query.confidence, 10),
                        knowledge : parseInt(req.query.knowledge, 10),
                    }).save().then((newUser)=>{
                        console.log('new user:',newUser);
                        Pvideo.aggregate(
                            [
                            {
                                $group:
                                {
                                    _id: "$path",
                                    avgEye: { $avg: "$eye" },
                                    avgVoice: { $avg: "$voice" },
                                    avgConfidence: { $avg: "$confidence" },
                                    avgKnowledge: { $avg: "$knowledge" },
                                }
                            }
                            ]
                        ).then((avgValues)=>{
                            var str = req.query.path
                            var str2 = str.toString(str)
                            var query = { path: str2 };
                            Video.updateOne(query,{$set:{peeravgeye:parseInt(avgValues[0].avgEye, 10),peeravgvoice:parseInt(avgValues[0].avgVoice, 10),peeravgconfidence:parseInt(avgValues[0].avgConfidence, 10),peeravgknowledge:parseInt(avgValues[0].avgKnowledge, 10)}}).then((updateds)=>{
                                Video.aggregate(
                                    [
                                    {
                                        $group:
                                        {
                                            _id: "$mail",
                                            avgEye: { $avg: "$peeravgeye" },
                                            avgVoice: { $avg: "$peeravgvoice" },
                                            avgConfidence: { $avg: "$peeravgconfidence" },
                                            avgKnowledge: { $avg: "$peeravgknowledge" },
                                        }
                                    }
                                    ]
                                ).then((avgUser)=>{
                                    var ctr;
                                    for(let i =0;i<avgUser.length;i++)
                                    {
                                        if(avgUser[i]._id==userMail.mail)
                                        {
                                            ctr = i;
                                        }
                                        console.log("This is Id=",avgUser[i]._id)
                                    }
                                    query = { mail: userMail.mail };
                                    console.log(parseInt(avgUser[ctr].avgEye,10))
                                    User.updateOne(query,{$set:{peeravgeye:parseInt(avgUser[ctr].avgEye, 10),peeravgvoice:parseInt(avgUser[ctr].avgVoice, 10),peeravgconfidence:parseInt(avgUser[ctr].avgConfidence, 10),peeravgknowledge:parseInt(avgUser[ctr].avgKnowledge, 10)}}).then((userInfo=>{
                                        console.log('this is users :',userInfo)
                                        User.findOne({mail:userMail.mail}).then((userDetails)=>{
                                            var favg = userDetails.peeravgeye+userDetails.peeravgvoice+userDetails.peeravgconfidence+userDetails.peeravgknowledge
                                            favg = favg/4;
                                            console.log(favg)
                                            User.updateOne(query,{$set:{peeravgall:parseInt(favg, 10)}}).then((Finaluser)=>{
                                                console.log('Updated User:',Finaluser)
                                                Video.find({path:req.query.path}).then((updatedvideo)=>{
                                                    console.log("This is original path:",req.query.path)
                                                    res.send({"video":updatedvideo})
                                                })
                                                
                                            })
                                        })
                                    }))
                                })
                            })
                        })
                    });
                })
            })
        }
    })

    

    
})


//Ajax response for marking inapropriate
router.get('/flag',(req,res)=>{
    console.log('this is =',req.query.path)
    console.log('this is =',req.user.mail)

    User.updateOne({ mail: req.user.mail },{ $push: { inapropriate: req.query.path } }).then((updatedData)=>{
        console.log(updatedData)
        Video.updateOne({path:req.query.path},{ $inc: {inapropriate_count:1}}).then((upatedvideo)=>{
            console.log(upatedvideo)
            res.send("ok")
        })
    })

});



// uploading introduction video starts here
router.post('/uploadintro',(req,res)=>{

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

        if(req.user.intropath != 'na')
        {
            var filename = req.user.intropath
            var lastname = filename.split('/')
            var purename = lastname[9].split('?')
            console.log('filename',purename[0])
            const file2 = bucket.file(purename[0]);
            file2.delete().then(function(data){
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
                        User.updateOne({mail:req.user.mail},{$set:{intropath:metadata.mediaLink}}).then((newVideo)=>{
                            console.log('new video:',newVideo);
                            res.redirect('/giveMyProfilepage'); 
                        });
                       
                      });
                    });
        
                });
            })
        }
        else
        {
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
                    User.updateOne({mail:req.user.mail},{$set:{intropath:metadata.mediaLink}}).then((newVideo)=>{
                        console.log('new video:',newVideo);
                        res.redirect('/giveMyProfilepage'); 
                    });
                   
                  });
                });
    
            });
        }
    });
})
// uploading introduction video ends here



// uploading profile photo  starts here
router.post('/updateprofile',(req,res)=>{

    //multer initialization
    var storage2 = multer.diskStorage({
        destination:'./public/uploads/images/',
        filename: function(req, file, cb) 
        {
        cb(null, file.fieldname + '-' + Date.now() +path.extname(file.originalname));
        }
    });
    var upload2 = multer({ storage: storage2 }).single('user_uploaded_pic');
    
    //upload video
    var videopath;
    upload2(req,res,function(err){
        var name = './public/uploads/images/'+req.file.filename
        console.log("name of file:",name)
        var gname = req.file.filename
        const options = {
            resumable: false,
            
        };


        if(req.user.ppath != 'na')
        {
            var filename = req.user.ppath
            var lastname = filename.split('/')
            var purename = lastname[9].split('?')
            console.log('filename',purename[0])
            const file2 = bucket.file(purename[0]);
            file2.delete().then(function(data){
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
                        User.updateOne({mail:req.user.mail},{$set:{ppath:metadata.mediaLink,name:req.body.name}}).then((newVideo)=>{
                            console.log('new video:',newVideo);
                            res.redirect('/giveMyProfilepage'); 
                        });
                       
                      });
                    });
        
                });
            })
        }
        else
        {
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
                    User.updateOne({mail:req.user.mail},{$set:{ppath:metadata.mediaLink,name:req.body.name}}).then((newVideo)=>{
                        console.log('new video:',newVideo);
                        res.redirect('/giveMyProfilepage'); 
                    });
                   
                  });
                });
    
            });
        }
    });
})
// uploading profile photo ends here

module.exports = router;