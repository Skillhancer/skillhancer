const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoSchema = new Schema({
    mail:String,
    name:String,
    title:String,
    description:String,
    path:String,
    vname:String,
    avgeye : Number,
    avgvoice : Number,
    avgconfidence : Number,
    avgknowledge : Number,
    peeravgeye : Number,
    peeravgvoice : Number,
    peeravgconfidence : Number,
    peeravgknowledge : Number,
    inapropriate_count : Number
})

const Video = mongoose.model('video',videoSchema);
module.exports = Video;