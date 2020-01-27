const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name : String,
    googleId : String,
    mail: String,
    ipath : String,
    intropath : String,
    ppath:String,
    avgeye : Number,
    avgvoice : Number,
    avgconfidence : Number,
    avgknowledge : Number,
    avgall : Number,
    peeravgeye : Number,
    peeravgvoice : Number,
    peeravgconfidence : Number,
    peeravgknowledge : Number,
    peeravgall : Number,
    gradecount : Number,
    
})

const User = mongoose.model('student',userSchema);
module.exports = User;