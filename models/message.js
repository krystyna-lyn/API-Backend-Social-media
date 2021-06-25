'use strict'

var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var MessageSchema=({
text:String,
viewed: String,
created_at: String,
nick:String,
emitter: {type: Schema.ObjectId, ref: 'User'},
receiver: {type: Schema.ObjectId, ref: 'User'}
});

module.exports=mongoose.model('Message', MessageSchema);