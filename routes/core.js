const router = require('express').Router();
const Video = require('../models/video')
const User = require('../models/user-models')
const Gvideo = require('../models/graded-video')
const References = require('../models/references')
const Pvideo = require('../models/peergraded-video')





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
        }
        else
        {
            console.log('Iam a student')
            console.log("This is voice:",parseInt(req.query.voice, 10))
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

module.exports = router;