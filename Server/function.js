const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const JSONbig = require('json-bigint')({'storeAsString': true,'alwaysParseAsBig':true})
const prompt = require('prompt-sync')({sigint: true})
const { default: Axios } = require('axios');

const Transaction = require('../Write_Transaction/Create_Transaction_Classes/Create_Transaction.js');
const Block = require('../Block/Read_Block_Classes/Block.js');

const  getRawBody = require('raw-body');

async function get_Peers(known_nodes,used_urls,peers_lim,My_url){
    let peers = [],res,len = known_nodes.length;
    console.log('Sending peer request to Potential Peers:')

    for(var i=0;i<len;i++){
        let url = known_nodes[i];
        var config = {
            method: 'post',
            url : url + '/newPeer',
            data : {"url": My_url},
            headers : {'Content-Type': 'application/json'}
        }
        try{
            res = await axios(config);                                                                              // send request to potential peers
            if(peers.length < peers_lim){                                                                           // Add them to the list of peers
                peers.push(url);
                console.log('new Peer: '+url);
            }
        }
        catch{console.error('error in sending request to '+url)}
        used_urls.push(url);                                                                                         // Adds the url to the Array used_urls
    }

    if(peers.length < peers_lim){
        var Potential_Peers = [];
        console.log('Asking for Potential Peers:')
        for(let url of known_nodes){
            var config = {
                method: 'get',
                url : url + '/getPeers',
                data : {"url": My_url},
                headers : {"Content-Type": 'application/json'}
            }
            try{
                res = await axios(config);                                                                             // Get potential peers from peers
                Potential_Peers = [...Potential_Peers,...res.data.peers];                                              // Add them to the list of potential peers
            }
            catch{console.error('error in sending request to '+url)}}


        Potential_Peers = Potential_Peers.filter(function(value, index, self) {return self.indexOf(value) === index;}) // filter for unique elements
        Potential_Peers = Potential_Peers.filter(function(item) {return !used_urls.includes(item);})                   // remove already uesd elements
        Potential_Peers = Potential_Peers.filter(function(a) {return a != My_url;})                                    // remove self

        if(Potential_Peers.length){
            let Arr = await get_Peers(Potential_Peers,used_urls,peers_lim-peers.length,My_url)                          // Get peers from potential peers
            peers = [...peers,...Arr]                                                                                   // Add them to the list of peers
        }
    }

    return peers;
}

async function get_Blocks(url,Mining_Fee){
    var status = 200,index = 0,O_map = new Map();
    console.log('Asking Blocks froms ' +url);
    while(status != 404){
        let res;
        try{res = await axios.get(url+'/getBlock/'+ index,{responseType: 'arraybuffer'});}                                   // Asks a peer for Block
        catch{status = 404}
        if(status==200){
            var New_Block = new Block(res.data,Mining_Fee);
            if(New_Block.Verify_Block()){
                New_Block.Display();
                console.log('Block '+index+' added')
                O_map = New_Block.Update_Output_Map(O_map);
                New_Block.Update_Unused_Output();                                                                           // Updates the Unused_Outputs.txt
                fs.writeFileSync('../Blocks/Block'+index.toString()+'.dat',res.data);                                       // Stores Block in memory
            }
            else{console.log('Block '+index+' Not Verified');}
            index = index + 1;
        }
    }
    return {index,O_map};
}

async function get_Pending_Transaction(url){
    console.log('Asking Pending Transactions from ' +url);
    var Pending_Transactions = [];

    let res = await axios.get(url + '/getPendingTransactions')                                                               // Asks a peer for Pending_Transactions
    for(let Txn of res.data){Pending_Transactions.push(new Transaction(Txn.inputs,Txn.outputs,0));}

    return Pending_Transactions;
}

module.exports.Initialize = async function (peers_arr,peers_lim,My_url,Mining_Fee) {                                          // All the above functions in 1 function 
    var Peers = [],Pending_Transactions = [],Index = 0,O_map = new Map;

    Peers = await get_Peers(peers_arr,Peers,peers_lim,My_url)                                                                         // Sets the Peers
    let obj = await get_Blocks(peers_arr[0],Mining_Fee)                                                                         // Stores The Blocks in storage
    Index  = obj.index;
    O_map = obj.O_map;
    Pending_Transactions = await get_Pending_Transaction(peers_arr[0])                                                                // Sets Pending_Transactions

    var result = {Peers,Pending_Transactions,Index,O_map};

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

module.exports.send_to_peers = function (peers,data,api,config,method,message) {
    for(let url of peers){
        try{
            let res = axios({
                method: method,
                url : url + api,
                data : data,
                headers : config
            })
            console.log(message+' sent to '+url+' Succesfully!');
        }catch{console.log('Error in sending '+message+' to '+url)}
    }
}

module.exports.get_Transactions = function (Pending_Transactions,Size_Lim) {
    var Transactions = [];

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
module.exports.add_Alias = function(url,Key){
    var publicKey,func = this.add_Alias,alias = prompt('Enter alias: ')
    if(Key == null){
        var publicKey_file = prompt('Enter Public key path: ')
        while(!fs.existsSync(publicKey_file)){
            console.log('No Such file exists!')
            publicKey_file = prompt('Enter Public key path: ')
        }
        var publicKey = fs.readFileSync(publicKey_file).toString();
    }
    else publicKey = Key;
    try{
        axios.post(url + '/addAlias',{publicKey,alias},{headers: {'Content-Type': 'application/json'}})
        console.log('Alias Successfully Added')
    }
    catch{
        if(error.response.status==400) {
            console.log('Alias already in use, Try different Alias!!');
            func(url,publicKey);
        }
        else{console.error(error);}
    }

}

module.exports.generate_Keys = function(){
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });
      var privateKey_file = prompt('Enter Private key path: ');
      fs.writeFileSync(privateKey_file,privateKey)
      var publicKey_file = prompt('Enter Public key path: ');
      fs.writeFileSync(publicKey_file,publicKey);
    }

module.exports.check_Balance = async function(url,json){
    var Json ;
    if(json==null){
        var key = prompt('You want to use alias or key? ')
        while(key!='alias'&&key!='key'){
            console.log('Error!! Wrong Input');
            key = prompt('You want to use alias or key? ')
        }
        if(key == 'alias') {
            var alias = prompt('Enter alias: ')
            Json = {alias};
        }
        else if(key == 'key'){
            while(key == 'key'){
                var key_file = prompt('Enter key file: ');
                if(fs.existsSync) {
                    key = fs.readFileSync(key_file).toString();
                    Json = {"publicKey": key};
                }
                else console.log('Error!! Wrong File');
            }
        }
    }
    else Json = json;
    var balance  = BigInt(0);
    var arr = [];
    const options = {
        method: 'post',
        url: url+"/getUnusedOutputs",
        data: Json,
        headers: {"Content-Type": "application/json"}
    }
    try{
        let res = await Axios(options);
        arr = res.data.unusedOutputs;
        balance = arr.reduce((previousValue,currentValue)=>previousValue + BigInt(currentValue.amount),BigInt(0));
    }catch{console.error(error)};

    return {"unusedOutputs":arr,balance};
}

async function get_Okey(url){
    var status = 404,key = prompt('You want to use alias or key? ')
    if(key == 'alias') {
        while(status==404)
        {var alias = prompt('Enter alias: ');
            const options = {
                method: 'post',
                url: url+"/getPublicKey",
                data: {alias}
            }
            try{
                let res = await Axios(options);
                key = res.data.publicKey;
                status = 200;
            }catch{};
        }
    }
    else if(key == 'key'){
        while(key == 'key'){
            var key_file = prompt('Enter key file: ');
            if(fs.existsSync(key_file)) {key = fs.readFileSync(key_file).toString();}
            else console.log('Error!! Wrong File');
        }
    }
    else {
        console.log('Error!! Wrong Input');
        key = get_Okey(url);
    }
    return key;
}

module.exports.make_transaction = async function(url){
    var publicKey = await get_Okey(url)
    var Unused_Outputs,outputs = [];

    await this.check_Balance(url,{publicKey})
    .then(function(a){
        console.log("Balance: "+ a.balance);
        Unused_Outputs = a.unusedOutputs;
    });

    var privateKey_file = prompt('Enter Private key path: ')
    while(!fs.existsSync(privateKey_file)){
        console.log('No such File exists, Enter Again!');
        privateKey_file = prompt('Enter Private key path: ');
    }
    var privateKey = fs.readFileSync(privateKey_file).toString();

    var Num_Outputs = prompt('No of Outputs: ');

    for(var i=0;i<Num_Outputs;i++){
        var recipient = await get_Okey(url)
        var amount = BigInt(prompt('Enter Amount: '));
        outputs.push({recipient,amount});
    }

    var Transaction_fee = prompt('Enter Transaction Fee: ');

    var Total_amt = outputs.reduce(function(acc,cur){return acc+cur.amount},BigInt(Transaction_fee));
    var sum = BigInt(0);

    var inputs = Unused_Outputs.filter(function(e){
        var bool = Total_amt >= sum;
        sum += BigInt(e.amount);
        return bool;
    });
    var amount = inputs.reduce(function(acc,cur){return acc+BigInt(cur.amount)},BigInt(0)) - Total_amt
    outputs.push({amount,"recipient":publicKey});
    outputs = JSONbig.stringify(outputs);
    outputs = JSONbig.parse(outputs);
    var txn = new Transaction(inputs,outputs,1,privateKey);
    if(txn.Verify_Transaction()){
        console.log(txn.JSON);
        console.log('Transaction sent to '+url+'/newTransaction');
        axios.post(url+'/newTransaction',txn.JSON,{headers: {'Content-Type': 'application/json'}});
    }
    else{console.log('Transaction not sent to '+url+'/newTransaction')}
}
