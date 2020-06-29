const express = require('express');
const bodyParser = require ('body-parser');
const fs = require('fs');

const Transaction = require('../Write_Transaction/Create_Transaction_Classes/Create_Transaction.js');
const Block = require('../Block/Read_Block_Classes/Block_Body');
const Create_Block = require('../Block/Create_Block_Classes/Block')
const funcs = require('./function');

let known_nodes = ['http://localhost:8000'];//temporary urls
var Index = 0,Pending_Transactions =[],peers =[];

funcs.Initialize(known_nodes,1,'http://localhost:8080')
.then(function (Arr) {
    peers = Arr[0];
    Pending_Transactions = Arr[1];
    Index = Arr[2];
})
.catch(function(error){console.error(error)});

const app = express();

app.use('getBlock',express.static('../Blocks',{ root : __dirname}));
app.use (bodyParser.urlencoded({extended : true}));
app.use (bodyParser.json());

app.get('/add/:Block_Index',function(req,res){
    var File_name = '../Blocks/Block' + req.params.Block_Index.toString()+'.dat' ;
    if(fs.existsSync(File_name)){
        var Byte = fs.readFileSync(File_name);
        res.setHeader("Content-Type", "application/octet-stream")
        res.send(Byte);
    }
    else{res.status(404).send('Block Not Found');}
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
    
    if(peers.includes(req.body.url)) {res.status(200).send('Peer already exist');}
    else {
        if(peers.length <= 2){                                      // Check if their is space for new peer
            console.log("new Peer: " + req.body.url);               // If peer is new & there is enough space peer is added to the Array of peers
            peers.push(req.body.url);
            res.status(200).send('Peer Added');
        }
        else res.status(500).send('Peer Limit reached!');     
    }
})

app.post('/newBlock',function(req,res){
    Num_Blocks++;
    var New_Block = new Block(res.data);                                                 // Processing Block:
    New_Block.Update_Unused_Output();                                                    // 1) Updates Unused_Oututs.txt
    Pending_Transactions = New_Block.Update_Pending_Transactions(Pending_Transactions);  // 2) Updates Pending_Transactions
    fs.writeFileSync('../Blocks/' + New_Block.Index , req.body);                         // 3) Stores the New Block
    funcs.send_to_peers(peers,req.body,'/newBlock');
    res.send('Block Added');
})

app.post('/newTransaction',function(req,res){
    var New_Transaction = new Transaction(req.body.inputs,req.body.outputs,0)

    if(Pending_Transactions.includes(New_Transaction)) {res.send('Transaction Already Exist');}
    else{
        Pending_Transactions.push(New_Transaction);                                       // Adds Transaction to Array of Pending_Transactions
        funcs.send_to_peers(peers,req.body,'/newTransaction')                             // Sends it to peers
        res.send('Transaction Added');
    }
})


var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log("server listening at http://%s:%s", host, port);
})