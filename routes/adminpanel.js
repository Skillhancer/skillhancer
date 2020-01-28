const router = require('express').Router();
const Video = require('../models/video')
const User = require('../models/user-models')
const Gvideo = require('../models/graded-video')
const admin = require('firebase-admin')
const serviceAccount = require('./preskiletprofessional-firebase-adminsdk-n9blw-61ade7872c.json')
const bucket = admin.storage().bucket()

//Ajax Response for giving videos
router.get('/giveInapropriateVideo',(req,res)=>{
    Video.find({inapropriate_count:{ $gt: 0 }}).sort({inapropriate_count:-1}).then((ivideos)=>{
        console.log("These are inapropriate videos:",ivideos)
        res.send(ivideos)
    })
})


//Ajax response for deleting video
router.get('/deletevideo',(req,res)=>{

    var video_name = String(req.query.name);
    console.log('Name : ',video_name)
    var vpath = String(req.query.path)

    if( video_name.length > 2000 || video_name.length < 5 || vpath > 2000 || vpath < 5)
    {
        console.log("length of video_name is greater then 20000 and less than 5 which can be vulnerable");
        res.send("400")
    }
    else
    {
    //1)delete from bucket
    const file = bucket.file(video_name);
    
    file.delete().then(function(data) {
        
        //2)delete from database:
        Video.deleteOne({vname:video_name}).then((vids)=>{
            Gvideo.deleteMany({$and:[{mail:req.query.mail},{path:vpath}]}).then((dvids)=>{
                //3)update user collection
                
                Video.find({mail:req.query.mail}).then((records)=>{
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
                                if(avgUser[i]._id==req.query.mail)
                                {
                                    ctr = i;
                                }
                                console.log("This is Id=",avgUser[i]._id)
                            }
                            query = { mail: req.query.mail};
                            User.updateOne(query,{$set:{avgeye:parseInt(avgUser[ctr].avgEye, 10),avgvoice:parseInt(avgUser[ctr].avgVoice, 10),avgconfidence:parseInt(avgUser[ctr].avgConfidence, 10),avgknowledge:parseInt(avgUser[ctr].avgKnowledge, 10)}}).then((userInfo=>{
                                console.log('this is users :',userInfo)
                                User.findOne({mail:req.query.mail}).then((userDetails)=>{
                                    var favg = userDetails.avgeye+userDetails.avgvoice+userDetails.avgconfidence+userDetails.avgknowledge
                                    favg = favg/4;
                                    console.log(favg)
                                    User.updateOne(query,{$set:{avgall:parseInt(favg, 10)}}).then((Finaluser)=>{
                                        User.find({mail:req.query.mail}).then((updatedUser)=>{
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
                        User.updateOne({mail:req.query.mail},{$set:{avgeye:0,avgvoice:0,avgconfidence:0,avgknowledge:0,avgall:0}}).then((updatedUser)=>{
                            res.send('Deleted');
                        })
                    }
                })
            })
        })
   
    });
}

})



module.exports = router;