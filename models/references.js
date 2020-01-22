const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const referenceSchema = new Schema({
    mails:Array,
})

const Video = mongoose.model('references',referenceSchema);
module.exports = Video;