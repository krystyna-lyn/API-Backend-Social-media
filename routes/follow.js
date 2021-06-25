'use strict'

var express=require('express');
var FollowController=require('../controllers/follow');
var api=express.Router();
var md_auth=require('../middlewares/autentificated');

api.post('/follow', md_auth.ensureAuth, FollowController.saveFollow);
api.delete('/follow/:id', md_auth.ensureAuth, FollowController.deleteFollow);
api.get('/following/:id/:page?', md_auth.ensureAuth, FollowController.getFollowing);
api.get('/followed/:id/:page?', md_auth.ensureAuth, FollowController.getFollowed);
api.get('/my-follows/:followed?', md_auth.ensureAuth, FollowController.getMyFollowing);

module.exports=api;

