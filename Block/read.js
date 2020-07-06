const fs = require('fs');
const prompt = require('prompt-sync')({sigint: true});
const axios = require('axios');
const crypto = require('crypto');
const request = require('request');
const Block_Body = require('./Read_Block_Classes/Block_Body');
var requestSettings = {
    method: 'GET',
    url: 'http://localhost:8780/add/0',
    responseType: 'arraybuffer'
};
axios(requestSettings).then(function(res){
    //console.log(res.data.slice(116));
    new Block_Body(Buffer.from(res.data)).Display();
    hash = crypto.createHash('sha256').update(res.data.slice(0,116)).digest('hex');
    console.log(hash);
})

// request(requestSettings, function(error, response, body) {
//     console.log(body);
//     
// });
