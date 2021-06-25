'use strict'

//load model user
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var Follow = require('../models/follow');
var Publication=require('../models/publication');

var jwt = require('../services/jwt');
var mongoose_paginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');
const { count } = require('../models/user');



function home(req, res) {
    res.status(200).send({
        message: 'Hola mundo'
    });
}
function pruebas(req, res) {
    res.status(200).send({
        message: 'Action of trying Node JS'
    });
}

//Register
function saveUser(req, res) {
    var params = req.body;
    var user = new User();

    if (params.name && params.surname && params.nick &&
        params.email && params.password) {
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        // control of duplicate users

        User.find({
            $or: [
                { email: user.email.toLowerCase() },
                { nick: user.nick.toLowerCase() }
            ]
        }).exec((err, users) => {

            if (err) return res.status(500).send({ message: 'Request error' });
            if (users && users.length >= 1) {
                return res.status(200).send({ message: 'User is already exists' });
            } else {
                //encrypt password

                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;

                    user.save((err, userStored) => {
                        if (err) return res.status(500).send({ message: 'Error by saving data' });

                        if (userStored) {
                            res.status(200).send({ user: userStored });

                        } else {
                            res.status(404).send({ message: 'User is not registered' });
                        }
                    });
                });
            }
        });
    } else {
        res.status(200).send({
            message: 'Send all of the fields with the necessary data'
        });
    }
}
//trying methods

function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({ email: email }, (err, user) => {
        if (err) return res.status(500).send({ message: 'Request error' });

        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {

                    if (params.gettoken) {
                        //return token
                        //generate token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        // return data
                        user.password = undefined;
                        return res.status(200).send({ user });
                    }

                } else {
                    return res.status(404).send({ message: 'User is not identified' });
                }

            });
        } else {
            return res.status(500).send({ message: 'User is not identified' });
        }
    });
}

// data of user

function getUser(req, res) {
    var userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: 'Request error' });

        if (!user) return res.status(404).send({ message: 'User not found' });

        followThisUser(req.user.sub, userId).then((value) => {
            return res.status(200).send({
                user,
                following: value.following,
                followed: value.followed
            });
        })
    });
}

async function followThisUser(identity_user_id, user_id) {
    var following = await Follow.findOne({ user: identity_user_id, followed: user_id }).exec()
        .then((following) => {
            return following;
        })
        .catch((err) => {
            return handleError(err);
        });
    var followed = await Follow.findOne({ user: user_id, followed: identity_user_id }).exec()
        .then((followed) => {
            return followed;
        })
        .catch((err) => {
            return handleError(err);
        });

    return {
        following: following,
        followed: followed
    };
}




function getUsers(req, res) {
    var identity_user_id = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;

    }
    var itemsPerPage = 8;

    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if (err) return res.status(500).send({ message: 'Request error' });

        if (!users) return res.status(404).send({ message: 'User not found' });
        followUserIds(identity_user_id).then((value) => {

            return res.status(200).send({
                users,
                users_following: value.following,
                users_follow_me: value.followed,
                total,
                pages: Math.ceil(total / itemsPerPage)
            });
        });
    });
}
async function followUserIds(user_id) {

    var following = await Follow.find({ "user": user_id }).select({ '_id': 0, '__uv': 0, 'user': 0 }).exec().then((follows) => {
        var follows_clean = [];
        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });
        console.log(follows_clean);
        return follows_clean;
      }).catch((err) => {
        return handleerror(err);
    });

    var followed = await Follow.find({ "followed": user_id }).select({ '_id': 0, '__uv': 0, 'followed': 0 }).exec().then((follows) => {
        var follows_clean = [];
        follows.forEach((follow) => {
            follows_clean.push(follow.user);
        });
        return follows_clean;
    }).catch((err) => {
        return handleerror(err);
    });

    console.log(following);
    return {
        following: following,
        followed: followed
    }
}

function getCounters(req,res){
   var userId=req.user.sub;
if(req.params.id){
    userId=req.params.id;
} 
getCountFollow(userId).then((value)=>{
    return res.status(200).send(value);
});  
}
async function getCountFollow(user_id) {
    var following = await Follow.countDocuments({ user: user_id })
        .exec()
        .then((count) => {
            console.log(count);
            return count;
        })
        .catch((err) => { return handleError(err); });
 
    var followed = await Follow.countDocuments({ followed: user_id })
        .exec()
        .then((count) => {
            return count;
        })
        .catch((err) => { return handleError(err);
         });
    var publications = await Publication.countDocuments({ 'user': user_id })
         .exec()
         .then((count) => {
             return count;
         })
         .catch((err) => { return handleError(err);
          });

    return {
        following:following,
        followed:followed,
        publications:publications
    }
}

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    delete update.password;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'you dont have permission to update' })
        
    }
    User.find({ $or: [
            { email: update.email},
            { nick: update.nick}
        ]}).exec((err, users) => {

        var user_isset=false;
        users.forEach((user)=>{
    if(user && user._id != userId) user_isset=true;
        });
    if(user_isset) return res.status(404).send({message: 'Name is already exist'});

    User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
        if(err) return res.status(500).send({
            message: 'You dont have a permission to update data'});

        if (!userUpdated) return res.status(404).send({ message: 'Cannot update data' });

        return res.status(200).send({ user: userUpdated });
    });
});


}
// image/AVATAR upload of user
function uploadImage(req, res) {
    var userId = req.params.id;


    if (req.files) {
        var file_path = req.files.image.path;
        console.log(file_path);

        var file_split = file_path.split('\\');
        console.log(file_split);

        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        console.log(ext_split);
        var file_ext = ext_split[1];

        if (userId != req.user.sub) {
            return removeFilesOfUploads(res, file_path, 'you dont have permission to update');
        }

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            //update

            User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {
                if (!userUpdated) return res.status(404).send({ message: 'Cannot update' });

                return res.status(200).send({ user: userUpdated });
            })
        } else {
            return removeFilesOfUploads(res, file_path, 'Extention is not valid');
        }

    } else {
        return res.status(200).send({ message: 'Cannot upload image' });
    }
}

function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({ message: message });
    });
}
function getImage(req, res) {
    var image_file = req.params.imageFile;
    var path_file = './uploads/users/' + image_file;

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(500).send({ message: 'Image doesnt exist' });
        }
    })

}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
   getCounters,
    updateUser,
    uploadImage,
    getImage
}