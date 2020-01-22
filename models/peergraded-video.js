const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gvideoSchema = new Schema({
    mail:String,
    grader_mail:String,
    path:String,
    eye : Number,
    voice : Number,
    confidence : Number,
    knowledge : Number,
})

const Gvideo = mongoose.model('peergraded_video',gvideoSchema);
module.exports = Gvideo;