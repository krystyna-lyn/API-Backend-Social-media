'use strict'

var express=require('express');


var UserController=require('../controllers/user');

var api=express.Router();

var md_auth=require('../middlewares/autentificated');
var multi=require('connect-multiparty');
var md_upload=multi({uploadDir: './uploads/users'});

api.get('/home',UserController.home);
api.get('/pruebas',md_auth.ensureAuth, UserController.pruebas);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id',md_auth.ensureAuth, UserController.getUser);
api.get('/users/:page?',md_auth.ensureAuth, UserController.getUsers);
api.get('/counters/:id?', md_auth.ensureAuth, UserController.getCounters);
api.put('/update-user/:id',md_auth.ensureAuth, UserController.updateUser);
api.post('/upload-image/:id',[md_auth.ensureAuth, md_upload], UserController.uploadImage);
api.get('/get-image/:imageFile',UserController.getImage);
module.exports=api;

