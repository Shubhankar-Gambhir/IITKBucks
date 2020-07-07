const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const  getRawBody = require('raw-body');

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
            index = index + 1 ;
            })
        .catch(function(error){status = error.response.status})                                                         // Updates the status if it is 404
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
    var Peers = [],Pending_Transactions = [],Index = 0;

    await get_Peers(peers_arr,Peers,peers_lim,My_url)                                                                      // Sets the Peers
    .then(function list(peers_list){Peers = peers_list},function(error){console.error(error)})
    .catch(function(error){console.error(error)});

    await get_Pending_Transaction(Peers[0])                                                                                // Sets Pending_Transactions
    .then(function(Transactions_list){Pending_Transactions = Transactions_list},function(error){console.error(error)})
    .catch(function(error){console.error(error)});

    await get_Blocks(Peers[0])                                                                                             // Stores The Blocks in storage
    .then(function (index) { Index = index},function(error){console.error(error)})                                                                              // and gives the current Index
    .catch(function(error){console.error(error)});

    var result = {Peers,Pending_Transactions,Index};

    return result;
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

module.exports.get_Transactions = function (Pending_Transactions,Size_Lim) {
    var Transactions = [new Transaction([],[],0,null)];

    if(Pending_Transactions.reduce((total, Txn) => total + Txn.Size,0) > Size_Lim){
        Transactions = Pending_Transactions.sort(function(a,b){return b.Fee_to_Size_Ratio - a.Fee_to_Size_Ratio});
        var Total_Size = 0;
        Transactions = Transactions.filter(function(value){
            Total_Size += value.Size;
            return Total_Size < Size_Lim;
        })
    }
    else{Transactions = Pending_Transactions;}
    return Transactions ;    
}

module.exports.Buffer_req = function (req, res, next) {
    if (req.headers['content-type'] === 'application/octet-stream') {
        getRawBody(req, {
            length: req.headers['content-length'],
            encoding: req.charset
        }, function (err, string) {
            if (err)return next(err);
            req.body = string;
            next();
        })
    }
    else {next();}
}
module.exports.get_Body_Hash = function(index){
    var path =  __filename.split('IITKBucks')[0].toString() + 'IITKBucks/Blocks/'
    var Byte = Buffer.from(fs.readFileSync(path+'Block'+index+'.dat'));
    return crypto.createHash('SHA256').update(Byte.slice(116)).digest('hex');
}
module.exports.to_JSON = function(data) {
    if (data !== undefined) {
        let intCount = 0, repCount = 0;
        const json = JSON.stringify(data, (_, v) => {
            if (typeof v === 'bigint') {
                intCount++;
                return `${v}#bigint`;
            }
            return v;
        });
        const res = json.replace(/"(-?\d+)#bigint"/g, (_, a) => {
            repCount++;
            return a;
        });
        if (repCount > intCount) {
            // You have a string somewhere that looks like "123#bigint";
            throw new Error(`BigInt serialization pattern conflict with a string value.`);
        }
        return res;
    }
}