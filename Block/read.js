const fs = require('fs');
const prompt = require('prompt-sync')({sigint: true});
const axios = require('axios');
const request = require('request');
const Block_Body = require('./Read_Block_Classes/Block_Body');
var requestSettings = {
    method: 'GET',
    url: 'http://localhost:8080/add/2',
    responseType: 'arraybuffer'
};
axios(requestSettings).then(function(res){
    //var Byte = Buffer.from(res.data);
    //console.log(Buffer.from(res.data));
    //console.log(res.config);
    //console.log(res.data.slice(116));
    var Block = new Block_Body(Buffer.from(res.data));
    Block.Display();
})

// request(requestSettings, function(error, response, body) {
//     console.log(body);
//     //hash = crypto.createHash('sha256').update(body).digest('hex');
//     //console.log(hash);
// });
