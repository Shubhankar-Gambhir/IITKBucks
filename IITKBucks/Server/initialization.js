const axios = require('axios');
const fs = require('fs');
const Transaction = require('../Write_Transaction/Create_Transaction_Classes/Create_Transaction.js');
const Block = require('../Block/Read_Block_Classes/Block_Body.js');

function get_Peers(peers_arr){
    let peers = [];
    for(let url of peers_arr){       
        axios.post(url + '/newPeer').then(function(res){      // Add as peer
            if(res.status == 200 ) peers.push(url);
        }).catch(function(error){console.error(error.response.request._response );})
        if(peers.length >= 2){return peers;}
    }

    if(peers.length < 2){       
        var Potential_Peers = [];
        for(let url of peers_arr){
            axios.get(url +'/getPeers').then(function(res){      // Find potential peers
                Potential_Peers.concat(res.data.peers);
            }).catch(function(error){console.error(error.response.request._response );}) 
        }
        Potential_Peers = Potential_Peers.filter(function(value, index, self) { // filter for distinct elements
            return self.indexOf(value) === index;
        })
    }
    var Arr = get_Peers(Potential_Peers); // Get peers from potential peers
    peers.concat(Arr);                    // Add them to the list of peers
    return peers;
}

function get_Blocks(peers){
    let url = peers[0];
    var status = 200;
    var index = 0;
    while(status != 404){
        axios.get(url+'/add/'+ index.toString()).then(function(res){
            status = res.status;
            var New_Block = new Block(res.data);
            New_Block.Update_Unused_Output();                           //Updates the Unused_Outputs.txt
            fs.writeFileSync('../Blocks/Block'+index.toString()+'.dat',res.data);
            index += 1;
        })
    }
}

function get_Pending_Transaction(peers){
    var Pending_Transactions = [];
    let url = peers[0];
    axios.get(url + '/getPendingTransactions').then(function(res){
        for(let Txn of personalbar.data){
        Pending_Transactions.push(new Transaction(Txn.inputs,Txn.outputs,0));
        }
    })
    return Pending_Transactions;
}

module.exports.get_Peers = get_Peers();
module.exports.get_Pending_Transaction = get_Pending_Transaction();
module.exports.get_Blocks = get_Blocks();