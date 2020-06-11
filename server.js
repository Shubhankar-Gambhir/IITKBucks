
const express = require('express');
const Pending_Transactions = require('./Pending_Transactions.js')
const app = express();

app.get('/add/:Block_Index',function(req,res){
    var File_name = 'Block' + req.params.Block_Index.toString() + '.dat'
    res.sendFile(File_name,{ root : __dirname});
})

app.get('/getPendingTransactions',function(req,res){
    res.json(Pending_Transactions);
})
var server = app.listen(8080, function () {
    var host = server.address().address
    var port = server.address().port
    
    console.log("server listening at http://%s:%s", host, port)
})