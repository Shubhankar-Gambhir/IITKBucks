const express = require('express');
const bodyParser = require ('body-parser');
const fs = require('fs');

const Transaction = require('../Write_Transaction/Create_Transaction_Classes/Create_Transaction.js');
const Block = require('../Block/Read_Block_Classes/Block_Body.js');
const initialization = require('./initialization');

let known_nodes = ['http://8c0090bc.ngrok.io' ,'http://52d3004ed431.ngrok.io'];//temporary urls

var peers = initialization.get_Peers(known_nodes);
var Pending_Transactions = initialization.get_Pending_Transaction(peers);
initialization.get_Blocks(peers);

const app = express();

app.use(express.static('./Blocks'));
app.use (bodyParser.urlencoded({extended : true}));
app.use (bodyParser.json());
var Num_Blocks = 0;


app.get('/add/:Block_Index',function(req,res){
    var File_name = 'Blocks/Block' + req.params.Block_Index.toString() + '.dat';
    var Byte = Buffer.from(fs.readFileSync(File_name,{encoding: 'utf8'}));
    res.setHeader("Content-Type", "application/octet-stream");
    res.send(Byte);
    res.sendFile(File_name,{ root : __dirname, encoding : 'binary'});
})

app.get('/getPendingTransactions',function(req,res){
    Pending_Txn =[];
    for(let Txn of Pending_Transactions){Pending_Txn.push(Txn.JSON)}
    res.json(Pending_Txn);
})

app.get('/getPeers',function(req,res){
    peer_JSON = {"peers": peers};
    res.json(peer_JSON);
});

app.post('/newPeer',function(req,res){
    if(peers.length <= 4) {
        for(let peer of peers) if(peer == req.body.url) res.status(200).send('Peer already exist');
        peer.push(req.body.url);
        res.status(200).send('Peer Added');
    }
    else res.status(500).send('Peer Limit reached!');
})

app.post('/newBlock',function(req,res){
    Num_Blocks++;
    var New_Block = new Block(res.data);
    New_Block.Update_Unused_Output();
    New_Block.Update_Pending_Transactions(Pending_Transactions);
    fs.writeFileSync('../Blocks/' + New_Block.Index + '.dat', req.body);
    res.send('Block Added');
})

app.post('/newTransaction',function(req,res){
    var New_Transaction = new Transaction(req.body.inputs,req.body.outputs,0);
    for(let Txn of Pending_Transactions) if(Txn.ID == New_Transaction.ID) res.send('Transaction Already Exist');
    Pending_Transactions.push(New_Transaction);
    res.send('Transaction Added');
})


var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log("server listening at http://%s:%s", host, port);
})