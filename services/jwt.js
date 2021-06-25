'use strict'

var jwt=require('jwt-simple');
var moment=require('moment');
var secret='key_secret_develop_social_media_angular';

exports.createToken=function(user){
var payload={
    sub: user._id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, 'days').unix
}

return jwt.encode(payload, secret);

}