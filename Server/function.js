const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const Transaction = require('../Write_Transaction/Create_Transaction_Classes/Create_Transaction.js');
const Block = require('../Block/Read_Block_Classes/Block.js');

async function get_Peers (peers_arr,peers_lim,My_url){
    let peers = [];
    for(let url of peers_arr){      
        await axios.post(url + '/newPeer',{"url": My_url},{headers: {'Content-Type': 'application/json'}})
        .then(function (res) {
            if(peers.length >= peers_lim){return peers};
            if(res.status == 200){peers.push(url)}; 
        })
        .catch(function(error){console.error(error)});
    }
    var new_peers_lim = peers_lim - peers.length;
    if(peers.length < peers_lim){       
        var Potential_Peers = [];
        for(let url of peers_arr){
            await axios.get(url +'/getPeers')                                                   // Get potential peers from peers
            .then(function(res){Potential_Peers = [...Potential_Peers,...res.data.peers]})    // Add them to the list of potential peers
            .catch(function(error){console.error(error)});
        }                                                        
        Potential_Peers = Potential_Peers.filter(function(value, index, self) {return self.indexOf(value) === index;}) // remove repeated elements 
        Potential_Peers = Potential_Peers.filter(function(item) {return !peers.includes(item);})                       // remove elements of peer
        Potential_Peers = Potential_Peers.filter(function(a) {return a != My_url;})                                    // remove self
        await get_Peers(Potential_Peers,new_peers_lim,My_url)     // Get peers from potential peers
        .then(function (Arr) {                                    // Add them to the list of peers
            peers = [...peers,...Arr];                            
            return peers;
        })
        .catch(function(error){console.error(error);})                         
    }
    return peers
}

async function get_Blocks(url){
    var status = 200;
    var index = 0;
    while(status != 404){
        await axios.get(url+'/add/'+ index.toString()).then(function(res){
            console.log(index);
            status = res.status;
            var New_Block = new Block(res.data);
            New_Block.Update_Unused_Output();                           //Updates the Unused_Outputs.txt
            fs.writeFileSync('../Blocks/Block'+index.toString()+'.dat',res.data);
            index += 1;
        })
    }
}

async function get_Pending_Transaction(url){
    var Pending_Transactions = [];
    await axios.get(url + '/getPendingTransactions').then(function(res){
        for(let Txn of res.data){
        Pending_Transactions.push(new Transaction(Txn.inputs,Txn.outputs,0));
        }
    })
    return Pending_Transactions;
}

module.exports.Initialize = async function (peers_arr,peers_lim,My_url) {
    var peer = [],Pending_Transactions = [];

    await get_Peers(peers_arr,peers_lim,My_url)
    .then(function list(peers_list){peer = peers_list})
    .catch(function(error){console.error(error)});

    await get_Pending_Transaction(peer[0])
    .then(function(Transactions_list){Pending_Transactions = Transactions_list})
    .catch(function(error){console.error(error)});

    //await get_Blocks(peer[0]);
    
    return [peer,Pending_Transactions];
}

module.exports.get_Hash = function(index,folder){
    if (index){
        var Byte = fs.readFileSync(folder+'/Block'+index+'.dat');
        return crypto.createHash('SHA256').update(Byte).digest('hex');
    }
    else {return 0000000000000000000000000000000000000000000000000000000000000000;}
}
