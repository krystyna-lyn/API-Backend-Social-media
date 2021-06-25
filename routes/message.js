'use strict'

var express=require('express');
var MessageController=require('../controllers/message');
var api=express.Router();
var md_auth=require('../middlewares/autentificated');

api.post('/message', md_auth.ensureAuth, MessageController.saveMessage);
api.get('/get-receiver/:page', md_auth.ensureAuth, MessageController.getReceivedMes);
api.get('/get-emitter/:page', md_auth.ensureAuth, MessageController.getEmitterMes);
api.get('/unviewed', md_auth.ensureAuth, MessageController.getUnviewed);
api.get('/set-viewed', md_auth.ensureAuth, MessageController.setViewed);
module.exports=api;