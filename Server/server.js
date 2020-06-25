const express = require('express');
const bodyParser = require ('body-parser');
const fs = require('fs');

const Transaction = require('../Write_Transaction/Create_Transaction_Classes/Create_Transaction.js');
const Block = require('../Block/Read_Block_Classes/Block_Body');
const Create_Block = require('../Block/Create_Block_Classes/Block')
const initialization = require('./function');

let known_nodes = ['http://8c0090bc.ngrok.io' ,'http://52d3004ed431.ngrok.io'];//temporary urls
var Index = 0

// var peers = initialization.get_Peers(known_nodes);
// var Pending_Transactions = initialization.get_Pending_Transaction(peers);
// initialization.get_Blocks(peers);
var Pending_Transactions = [];
var peers = [];
const app = express();

app.use('getBlock',express.static('../Blocks',{ root : __dirname}));
app.use (bodyParser.urlencoded({extended : true}));
app.use (bodyParser.json());
var Num_Blocks = 0;


app.get('/add/:Block_Index',function(req,res){
    var File_name = '../Blocks/Block' + req.params.Block_Index.toString()+'.dat' ;
    var Byte = fs.readFileSync(File_name);
    res.setHeader("Content-Type", "application/octet-stream");
    res.send(Byte);
})

app.get('/getPendingTransactions',function(req,res){
    Pending_Txn =[];
    for(let Txn of Pending_Transactions){Pending_Txn.push(Txn.JSON);} // Array of Txn in desired format
    res.json(Pending_Txn);
})

app.get('/getPeers',function(req,res){
    peer_JSON = {"peers": peers};
    res.json(peer_JSON);
});

app.post('/newPeer',function(req,res){
    var Is_peer_new = true;
    if(peers.length <= 4) {                                 // Check if their is space for new peer
        for(let peer of peers) {
            if(peer == req.body.url) {                      // Check if the peers is new or repeated
                res.status(200).send('Peer already exist');
                Is_peer_new = false;
            }
        }
        if(Is_peer_new){                                    // If peer is new it is added to the Array of peers
            peers.push(req.body.url);
            res.status(200).send('Peer Added');
        }
    }
    else res.status(500).send('Peer Limit reached!');
})

app.post('/newBlock',function(req,res){
    Num_Blocks++;
    var New_Block = new Block(res.data);                                                 // Processing Block
    New_Block.Update_Unused_Output();                                                    // 1) Updates Unused_Oututs.txt
    Pending_Transactions = New_Block.Update_Pending_Transactions(Pending_Transactions);  // 2) Updates Pending_Transactions
    fs.writeFileSync('../Blocks/' + New_Block.Index , req.body);                         // 3) Stores the New Block
    res.send('Block Added');
})

app.post('/newTransaction',function(req,res){
    var New_Transaction = new Transaction(req.body.inputs,req.body.outputs,0)
    var Is_Transaction_New = true;
    for(let Txn of Pending_Transactions) {                    // Check if Transaction is new or repeated
        if(Txn.ID == New_Transaction.ID){
            res.send('Transaction Already Exist');
            Is_Transaction_New = false;
        } 
    }
    if(Is_Transaction_New) {                                  // Adds Transaction to Array of Pending_Transactions
        Pending_Transactions.push(New_Transaction);
        res.send('Transaction Added');
    }
})
// app.post('/CreateBlock',function (req,res) {
//     Index++
//     var block = new Create_Block(Index,'0000f00000000000000000000000000000000000000000000000000000000000',Pending_Transactions,'../Blocks');
//     console.log(block.Block_Buf)
//     fs.writeFileSync('../Blocks/Block'+ Index+'.dat',block.Block_Buf);
//     res.send(block);
// })


var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log("server listening at http://%s:%s", host, port);
})