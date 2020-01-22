const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name : String,
    googleId : String,
    mail: String,
    ipath : String,
    avgeye : Number,
    avgvoice : Number,
    avgconfidence : Number,
    avgknowledge : Number,
    avgall : Number,
    gradecount : Number,
    inapropriate : [String]
})

const User = mongoose.model('student',userSchema);
module.exports = User;