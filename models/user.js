let mongoose = require('mongoose');
let bcrypt = require('bcrypt');
let nodemailer = require('nodemailer');


mongoose.connect('mongodb://localhost:27017/nodeAuth');
 let db = mongoose.connection;

 let UserSchema = mongoose.Schema({
     name: {
         type: String,
         index: true,
         required: true
     },

     email: {
        type: String,
        required: true,
        unique: true
     },

     password: {
        type: String, 
        required: true,
         bcrypt: true,
     },

     date: {
         type: Date,
         default: Date.now(),
     }
 });

    let User = module.exports = mongoose.model('User', UserSchema);
    
    module.exports.createUser = function (newUser, callback) {
    bcrypt.hash(newUser.password, 10, function(err, hash){
        if (err) throw err;
         //set hash password
         newUser.password = hash;
         //create user
         newUser.save(callback);

         //send a mail Register Users
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'xxx@xx.com',
                pass: 'xxxxx'
            }
        });
//.....Sending the sending option
        let mailOptions = {
            from: newUser.email,
            to: 'gaiyaobed94@gmail.com',
            subject: 'Node mailer',
            text: "You have a new form Registration with the following details.." + "Name:" + newUser.name + " " + "email"  + " " + newUser.email
        };

        transporter.sendMail(mailOptions, function(err, info) {
            if(err) throw err;
                console.log("message Sent!!" + newUser.email);
        });
    });
}



let getID = mongoose.model('id', UserSchema);

// find all athletes who play tennis, selecting the 'name' and 'age' fields
getID.find({}, function(err, result) {
    if (err) throw  err;
    console.log(result);
})


