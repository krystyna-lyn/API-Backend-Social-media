'use strict'

var jwt=require('jwt-simple');
var moment=require('moment');
var secret='key_secret_develop_social_media_angular';

exports.ensureAuth=function(req, res, next){
if(!req.headers.authorization){
return res.status(403).send({message: 'request not found'})
}

var token=req.headers.authorization.replace(/['"]+/g, '');

try{
    var payload=jwt.decode(token, secret);
    
    if(payload.exp<=moment().unix()){
return res.status(401).send({message: 'Token expired'})

    }
}catch(ex){
    return res.status(404).send({message: 'Token not valid'})
}
req.user=payload;

next();

}