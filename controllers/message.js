'use strict'

var moment=require('moment');
var mongoosePaginate=require('mongoose-pagination');

var User=require('../models/user');
var Follow=require('../models/follow');
var Message=require('../models/message');
const user = require('../models/user');

function prueba(req,res){

    res.status(200).send({message:'Hola Messages'});
}

function saveMessage(req,res){
    var params=req.body;

if(!params.text || !params.receiver) 
return res.status(200).send({message:'Send message'});
    var message=new Message();

    message.emitter=req.user.sub;
    message.receiver=params.receiver;
    message.text=params.text;
    message.created_at=moment().unix();
    message.viewed='false';

  message.save((err, messageStored)=>{
    if(err) return res.status(500).send({message:'Error by saving'});
    if(!messageStored) return res.status(404).send({message:'Cannot send message'});

    return  res.status(200).send({message:messageStored});
});
}
function getReceivedMes(req,res){
    var userId=req.user.sub;

    var page=1;

    if(req.params.page){
        page=req.params.page;
    }
    var itemsPerPage=4;

    Message.find({receiver: userId}).populate('emitter', 'name surname image nick _id').sort('-created_at').paginate(page,itemsPerPage,(err, messages, total)=>{
        if(err) return res.status(500).send({message:'Request Error'});
        if(!messages) return res.status(404).send({message:'No messages'});
    
        return  res.status(200).send({
            
            total:total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });  
    })

}
function getEmitterMes(req,res){
    var userId=req.user.sub;

    var page=1;

    if(req.params.page){
        page=req.params.page;
    }
    var itemsPerPage=4;

    Message.find({emitter: userId}).populate('emitter receiver', 'name surname image _id nick').sort('-created_at').paginate(page,itemsPerPage,(err, messages, total)=>{
        if(err) return res.status(500).send({message:'Request Error'});
        if(!messages) return res.status(404).send({message:'No messages'});
    
        return  res.status(200).send({
            
            total:total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });  
    })

}

function getUnviewed(req,res){
    var userId=req.user.sub;

    Message.count({receiver:userId, viewed:'false'}).exec((err,count)=>{
        if(err) return res.status(500).send({message:'Request Error'});
        return res.status(200).send({'unviewed':count}); 
    })
}
function setViewed(req,res){
    var userId=req.user.sub;

    Message.update({receiver:userId, viewed:'false'}, {viewed: 'true'}, {'multi':true},(err,messageUpdate)=>{
        if(err) return res.status(500).send({message:'Request Error'});
        return res.status(200).send({messages:messageUpdate}); 
    });
}
module.exports={
    prueba,
    saveMessage,
    getReceivedMes,
    getEmitterMes,
    getUnviewed,
    setViewed

}