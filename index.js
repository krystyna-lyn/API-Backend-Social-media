'use strict'

var mongoose=require('mongoose');
var app=require('./app');
var port=3800;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;


mongoose.connect('mongodb://localhost:27017/social-media', { useNewUrlParser:true, useUnifiedTopology: true })
.then(()=>{

    console.log("Connection works!");

    //create server
    app.listen(port,()=>{
        console.log("Server running in http://localhost:3800");
    })
})
.catch(err=>console.log(err));

