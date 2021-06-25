'use strict'

//var path=require('path');
//var fs=require('fs');
var mongoose_paginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');

function saveFollow(req, res) {
    var params = req.body;

    var follow = new Follow();

    follow.user = req.user.sub;
    follow.followed = params.followed; //user id per POST will be followed params.followed

    follow.save((err, followStored) => {
        if (err) return res.status(500).send({ message: 'Follow error' });
        if (!followStored) return res.status(404).send({ message: 'Cannot follow' });
        return res.status(200).send({ follow: followStored });
    })
}
function deleteFollow(req, res) {
    var userId = req.user.sub;
    var followId = req.params.id;

    Follow.find({ 'user': userId, 'followed': followId }).remove(err => {
        if (err) return res.status(500).send({ message: 'Cannot delete follow' });
        return res.status(200).send({ message: 'Follow deleted' });
    })
}
function getFollowing(req, res) {
    var userId = req.user.sub;

    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id;
    }
    var itemsPerPage = 4;

    Follow.find({ user: userId }).populate({ path: 'followed' }).paginate(page, itemsPerPage,
        (err, follows, total) => {
            if (err) return res.status(500).send({ message: 'Error in server' });
            if (!follows) return res.status(404).send({ message: 'no following' });

            followUserIds(req.user.sub).then((value)=>{
            return res.status(200).send({
                total: total,
                pages: Math.ceil(total / itemsPerPage),
                follows,
                users_following: value.following,
                users_follow_me: value.followed
            });
        });
        })
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


function getFollowed(req, res) {
    var userId = req.user.sub;

    if (req.params.id && req.params.page) {
        userId = req.params.id;
    }
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    } else {
        page = req.params.id;
    }
    var itemsPerPage = 4;

    Follow.find({ followed: userId }).populate('user').paginate(page, itemsPerPage,
        (err, follows, total) => {
            if (err) return res.status(500).send({ message: 'Error in server' });
            if (!follows) return res.status(404).send({ message: 'doesnt follow anybody' });

            
            followUserIds(req.user.sub).then((value)=>{
                return res.status(200).send({
                    total: total,
                    pages: Math.ceil(total / itemsPerPage),
                    follows,
                    users_following: value.following,
                    users_follow_me: value.followed
                });
            });
       
        })
}




function getMyFollowing(req, res) {
    var userId = req.user.sub;


    var find = Follow.find({ user: userId });
    if (req.params.followed) {
        find = Follow.find({ followed: userId });
    }


    find.populate('user followed').exec((err, follows) => {
        if (err) return res.status(500).send({ message: 'Error in server' });
        if (!follows) return res.status(404).send({ message: 'you dont follow anybody' });
        return res.status(200).send({ follows });
    })
}


module.exports = {
    saveFollow,
    deleteFollow,
    getFollowing,
    getFollowed,
    getMyFollowing
}