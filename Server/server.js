const express = require('express');
const bodyParser = require ('body-parser');
const fs = require('fs');
const Axios = require('axios');
const { fork } = require('child_process');
const { SIGINT } = require('constants');
const Transaction = require('../Write_Transaction/Create_Transaction_Classes/Create_Transaction.js');
const Block = require('../Block/Read_Block_Classes/Block_Body');
const funcs = require('./function');

let known_nodes = ['http://localhost:8000'],Index = 0,Pending_Transactions = [new Transaction([],[],0,null)];
let Size_Lim = 100000,peers =[],Mining_Fee = 1000,person = "p0",Mining = true,My_url = 'http://localhost:8080';
const Target = '0000000f00000000000000000000000000000000000000000000000000000000' ;

var process = fork('./mine.js')

funcs.Initialize(known_nodes,1,My_url)
.then(function (Data) {
    peers = Data.Peers;
    Pending_Transactions = Data.Pending_Transactions;
    Index = Data.Index;

    if(Pending_Transactions.length || Index == 0){
        Transactions = funcs.get_Transactions(Pending_Transactions,Size_Lim)
        var message = funcs.to_JSON({Index,Target,Transactions,Mining_Fee,person})
        process.send(message)
        Mining = true;
        process.on('message', (message) => {
            Axios.post(My_url+'/newBlock',Buffer.from(message.Buffer),{headers: {'Content-Type': 'application/octet-stream'}})
            .catch(function(err){console.error(err);})
        }); 
        Mining = false;
    }
    else{
        process.kill();
        Mining = false;
    }
})
.catch(function(error){console.error(error)});

const app = express();

app.use (bodyParser.urlencoded({extended : true}));
app.use (bodyParser.json());
app.use(funcs.Buffer_req);

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
    var str,New_Block = new Block(req.body,Mining_Fee);
    New_Block.Display();

    if(!fs.existsSync('../Blocks/Block' + New_Block.Index +'.dat')){
        if(New_Block.Verify_Block()){                                                            // Processing Block:
            process.kill(SIGINT);
            Mining = false;

            New_Block.Update_Unused_Output();                                                    // 1) Updates Unused_Oututs.txt
            Pending_Transactions = New_Block.Update_Pending_Transactions(Pending_Transactions);  // 2) Updates Pending_Transactions
            fs.writeFileSync('../Blocks/Block' + New_Block.Index +'.dat', req.body);             // 3) Stores the New Block
    
            for(let url of peers){Axios.post(url+'/newBlock',req.body,{headers: {'Content-Type': 'application/octet-stream'}})}    
            str ='Block Added';


            if(Pending_Transactions.length){
                Transactions = funcs.get_Transactions(Pending_Transactions,Size_Lim)
                var message = funcs.to_JSON({Index,Target,Transactions,Mining_Fee,person})
                process = fork('./mine.js');
                process.send(message)
                Mining = true;
                process.on('message', (message) => {
                    Axios.post(My_url+'/newBlock',Buffer.from(message.Buffer),{headers: {'Content-Type': 'application/octet-stream'}})
                    .catch(function(err){console.error(err);})
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
    res.send(str);
})

app.post('/newTransaction',function(req,res){
    var N_Txn = new Transaction(req.body.inputs,req.body.outputs,0,'p0');
    var flag = Pending_Transactions.reduce((acc,a) => acc || (a.ID == N_Txn.ID),false);

    if(flag) {res.send('Transaction Already Exist');}
    else{
        Pending_Transactions.push(N_Txn);                                                 // Adds Transaction to Array of Pending_Transactions
        funcs.send_to_peers(peers,req.body,'/newTransaction')                             // Sends it to peers

        if(!Mining){
            process = fork('./mine.js');

            var Transactions = funcs.get_Transactions(Pending_Transactions,Size_Lim);
            var message = funcs.to_JSON({Index,Target,Transactions,Mining_Fee,person});

            process.send(message);
            Mining = true;
            process.on('message', (message) => {
                Axios.post(My_url+'/newBlock',Buffer.from(message.Buffer),{headers: {'Content-Type': 'application/octet-stream'}})
                .catch(function(err){console.error(err);})
            }); 
            Mining = false;
        }        
        res.send('Transaction Added');
    }
})

var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log("server listening at http://%s:%s", host, port);
})