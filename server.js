const express = require('express');
const bodyParser = require ('body-parser');
const fs = require('fs');
const Axios = require('axios');
const JSONbig = require('json-bigint')({'storeAsString': true});
const prompt = require('prompt-sync')({sigint: true})
const funcs = require('./function');

const { fork } = require('child_process');

const Transaction = require('../Write_Transaction/Create_Transaction_Classes/Create_Transaction.js');
const Block = require('../Block/Read_Block_Classes/Block_Body');

let Index = 0,Pending_Transactions = [],Mining = false,peers =[];
let My_url = prompt("Enter server's url: ");
var port = Number(prompt('port: '));
let file = prompt("Enter server's Public Key file: ")
var key = fs.readFileSync(file).toString();
let Size_Lim = Number(prompt("Enter peer limit: "));
let Mining_Fee = BigInt(prompt('Enter Mining Fee: '));
let Target = prompt('Enter Target Value: ') ;
let alias_to_key = new Map,unused_outputs = new Map;
var process = fork('./mine.js')
var num_known_node = Number(prompt("Enter no of known nodes: "))

var known_nodes = [];
for(var i=0;i<num_known_node;i++){
    var url = prompt('Enter url: ');
    known_nodes.push(url);
}

if(known_nodes.length){
    funcs.Initialize(known_nodes,(Size_Lim/2),My_url,Mining_Fee)
    .then(function (Data) {
        peers = Data.Peers;
        console.log(peers);
        Pending_Transactions = Data.Pending_Transactions;
        console.log(Pending_Transactions);
        Index = Data.Index;
        console.log('current index: ',Index);
        unused_outputs = Data.O_map;

        if(Pending_Transactions.length || Index == 0){
            Transactions = funcs.get_Transactions(Pending_Transactions,Size_Lim)
            var message = JSONbig.stringify({Index,Target,Transactions,Mining_Fee,key})
            process.send(message)
            Mining = true;
            process.on('message', (message) => {
                Axios.post(My_url+'/newBlock',Buffer.from(message.Buffer),{headers: {'Content-Type': 'application/octet-stream'}})
                .catch(function(err){console.error(err);})
                Index++;
            });
            Mining = false;
        }
        else process.kill();
        })
    .catch(function(error){console.error(error)});
}

const app = express();

app.use (bodyParser.urlencoded({extended : true}));
app.use (bodyParser.json());
app.use(funcs.Buffer_req);

app.get('/getBlock/:Block_Index',function(req,res){
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

app.post('/getPublicKey',function(req,res){
    if(alias_to_key.has(req.body.alias)){
        var publicKey = alias_to_key.get(req.body.alias);
        res.json({publicKey});
    }
    else res.sendStatus(404);
})

app.post('/getUnusedOutputs',function(req,res){
    var key;
    if('alias' in req.body) {key = alias_to_key.get(req.body.alias);}
    else{key = req.body.publicKey;}
    var unusedOutputs = [];
    if(unused_outputs.has(key)){unusedOutputs = unused_outputs.get(key)};
    res.json({unusedOutputs});
})

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
app.post('/addAlias',function(req,res){
    if (alias_to_key.has(req.body.alias)) {
        if(alias_to_key.get(req.body.alias)!= req.body.publicKey) res.sendStatus(400);
        else res.sendStatus(200);
    }
    else {
        alias_to_key.set(req.body.alias,req.body.publicKey.toString());
        if(!unused_outputs.has(req.body.publickey)) unused_outputs.set(req.body.publickey,[]);
        res.send('Alias Added!');
    }
})

app.post('/newBlock',function(req,res){
    var str,New_Block = new Block(req.body,Mining_Fee);

    if(!fs.existsSync('../Blocks/Block' + New_Block.Index +'.dat')){
        if(New_Block.Verify_Block()){                                                            // Processing Block:
            New_Block.Display();
            if(Mining){
                process.kill(SIGINT);
                console.log('Mining Terminated');
            }
            Mining = false;

            unused_outputs = New_Block.Update_Output_Map(unused_outputs);
            Pending_Transactions = New_Block.Update_Pending_Transactions(Pending_Transactions);  // 1) Updates Pending_Transactions
            New_Block.Update_Unused_Output();                                                    // 2) Updates Unused_Oututs.txt
            fs.writeFileSync('../Blocks/Block' + New_Block.Index +'.dat', req.body);             // 3) Stores the New Block

            funcs.send_to_peers(peers,req.body,'/newBlock',{'Content-Type': 'application/octet-stream'},'post','Block')
            str ='Block Added';


            if(Pending_Transactions.length){
                Transactions = funcs.get_Transactions(Pending_Transactions,Size_Lim);
                var message = ({Index,Target,Transactions,Mining_Fee,key});
                process = fork('./mine.js');
                process.send(message);
                Mining = true;
                process.on('message', (message) => {
                    funcs.send_to_peers([My_url],Buffer.from(message.Buffer),'/newBlock',{headers: {'Content-Type': 'application/octet-stream'}});
                    Index ++
                });
                Mining = false;
            }
        }
        else{str = 'Block Not Verified';}
    }
    else{
        var File_name = '../Blocks/Block' + New_Block.Index + '_' + New_Block.Header_Hash +'.dat';
        if(New_Block.Header_Hash != funcs.get_Hash(New_Block.Index) && !fs.existsSync(File_name)){
            fs.writeFileSync(File_name,req.body)
            str = 'Extra Block Added';
        }
        else str = 'Block Already Exist';
    }
    console.log(str);
    res.send(str);
})

app.post('/newTransaction',function(req,res){
    console.log('Transaction recieved')
    var N_Txn = new Transaction(req.body.inputs,req.body.outputs,0,key);
    var flag = Pending_Transactions.reduce((acc,a) => acc || (a.ID == N_Txn.ID),false);
    if(flag) {
        console.log('Transaction Already Exist');
        res.send('Transaction Already Exist');
    }
    else if(N_Txn.Verify_Transaction()){
        Pending_Transactions.push(N_Txn);                                                                   // Adds Transaction to Array of Pending_Transactions
        for(let url in peers){
            Axios.post(url+'/newTransaction',{headers: {'Content-Type': 'application/json'}})
        }
        funcs.send_to_peers(peers,N_Txn.JSON,'/newTransaction',{'Content-Type': 'application/json'},'post',)   // Sends it to peers

        if(!Mining){
            process = fork('./mine.js');

            var Transactions = funcs.get_Transactions(Pending_Transactions,Size_Lim);
            var message = funcs.to_JSON({Index,Target,Transactions,Mining_Fee,key});

            process.send(message);
            Mining = true;
            process.on('message', (message) => {
                Axios.post(My_url+'/newBlock',Buffer.from(message.Buffer),{headers: {'Content-Type': 'application/octet-stream'}})
                .catch(function(err){console.error(err);});
                Index++
            });
            Mining = false;
        }
        console.log('Transaction Added!')
        res.send('Transaction Added');
    }
    else{
        console.log('Transaction not verifed!')
        res.send('Transaction not verifed!');
    }
})

var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("server listening at http://%s:%s", host, port);
})