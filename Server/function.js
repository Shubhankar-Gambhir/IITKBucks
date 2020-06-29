const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');

const Transaction = require('../Write_Transaction/Create_Transaction_Classes/Create_Transaction.js');
const Block = require('../Block/Read_Block_Classes/Block.js');

async function get_Peers (known_nodes,used_urls,peers_lim,My_url){
    var peers = [];
    for(let url of known_nodes){      
        await axios.post(url + '/newPeer',{"url": My_url},{headers: {'Content-Type': 'application/json'}})            // Get peers from peers_Arr
        .then(function (res) {if(peers.length < peers_lim){peers.push(url)}})                                         // Add them to the list of peers
        .catch(function(error){if(error.response.status!=500) console.error(error)})
        used_urls.push(url);                                                                                          // Adds the url to the Array used_urls
    }
    
    if(peers.length < peers_lim){       
        var Potential_Peers = [];
        
        for(let url of known_nodes){
            await axios.get(url +'/getPeers')                                                                          // Get potential peers from peers
            .then(function(res){Potential_Peers = [...Potential_Peers,...res.data.peers]})                             // Add them to the list of potential peers
            .catch(function(error){console.error(error.response)});
        }                                                        
        
        Potential_Peers = Potential_Peers.filter(function(value, index, self) {return self.indexOf(value) === index;}) // filter for unique elements 
        Potential_Peers = Potential_Peers.filter(function(item) {return !used_urls.includes(item);})                   // remove already uesd elements 
        Potential_Peers = Potential_Peers.filter(function(a) {return a != My_url;})                                    // remove self
       
        if(Potential_Peers.length){
            await get_Peers(Potential_Peers,used_urls,peers_lim-peers.length,My_url)                                   // Get peers from potential peers
            .then(function (Arr) {peers = [...peers,...Arr]})                                                          // Add them to the list of peers   
            .catch(function(error){console.error(error);})   
        }                          
    }

    return peers
}

async function get_Blocks(url){
    var status = 200;
    var index = 0;
    while(status != 404){
        await axios.get(url+'/add/'+ index,{responseType: 'arraybuffer'})
        .then(function(res){                                                                                            // Asks a peer for Block
            var New_Block = new Block(res.data);
            New_Block.Update_Unused_Output();                                                                           // Updates the Unused_Outputs.txt
            fs.writeFileSync('../Blocks/Block'+index.toString()+'.dat',res.data);                                       // Stores Block in memory
            index += 1; })
        .catch(function(error){console.error(error);})                                                        // Updates the status if it is 404
                                 
    }
    return index;
}

async function get_Pending_Transaction(url){
    var Pending_Transactions = [];

    await axios.get(url + '/getPendingTransactions')                                                                    // Asks a peer for Pending_Transactions
    .then(function(res){                                                                                                // Adds them to ao our Array
        for(let Txn of res.data){
            Pending_Transactions.push(new Transaction(Txn.inputs,Txn.outputs,0));
        }})
    .catch(function(error){console.error(error);})                         

    return Pending_Transactions;
}

module.exports.Initialize = async function (peers_arr,peers_lim,My_url) {                                                 // All the above functions in 1 function 
    var Peer = [],Pending_Transactions = [],index = 0;

    await get_Peers(peers_arr,Peer,peers_lim,My_url)                                                                      // Sets the Peers
    .then(function list(peers_list){Peer = peers_list})
    .catch(function(error){console.error(error)});

    await get_Pending_Transaction(Peer[0])                                                                                // Sets Pending_Transactions
    .then(function(Transactions_list){Pending_Transactions = Transactions_list})
    .catch(function(error){console.error(error)});

    await get_Blocks(Peer[0])                                                                                             // Stores The Blocks in storage
    .then(function (Index) { index = Index})                                                                              // and gives the current Index
    .catch(function(error){console.error(error)});

    return [Peer,Pending_Transactions,index];
}

module.exports.get_Hash = function(index){
    if (index + 1){
        var path =  __filename.split('IITKBucks')[0].toString() + 'IITKBucks/Blocks/'
        var Byte = Buffer.from(fs.readFileSync(path+'Block'+index+'.dat'));
        return crypto.createHash('SHA256').update(Byte.slice(0,116)).digest('hex');
    }
    else {return 0000000000000000000000000000000000000000000000000000000000000000;}
}

module.exports.send_to_peers = function (peers,data,api) {
    for(let url of peers){
        axios.post(url+api,data)
    }
}