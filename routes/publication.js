'use strict'

var express=require('express');
var PublicationController=require('../controllers/publication');
var api=express.Router();
var md_auth=require('../middlewares/autentificated');

var multipart=require('connect-multiparty');
var md_upload=multipart({uploadDir: './uploads/c'});

api.get('/prueba-pub', md_auth.ensureAuth, PublicationController.prueba);
api.post('/save-post', md_auth.ensureAuth, PublicationController.savePublication);
api.get('/post/:page?', md_auth.ensureAuth, PublicationController.getPublications);
api.get('/post-user/:user/:page?', md_auth.ensureAuth, PublicationController.getPublicationsUser);
api.get('/get-post/:id', md_auth.ensureAuth, PublicationController.getPublication);
api.delete('/delete-post/:id', md_auth.ensureAuth, PublicationController.deletePub);
api.post('/upload-post-img/:id', [md_auth.ensureAuth,md_upload], PublicationController.uploadPubImage);
api.get('/get-post-img/:imageFile',PublicationController.getPubImage);
module.exports=api;
