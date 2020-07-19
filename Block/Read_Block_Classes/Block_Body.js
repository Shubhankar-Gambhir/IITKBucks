const transaction = require('../../Read_Transaction/Read_Transaction_Classes/Read_Transaction');
const crypto = require('crypto');
const func = require('../../Server/function');
const Hash = func.get_Hash;

class Block{
    constructor(Byte,Mining_Fees){
        this.Head = Buffer.from(Byte).slice(0,116);
        this.Byte = Buffer.from(Byte).slice(116);
        this.Index = this.Head.slice(0,4).readUInt32BE(0);
        this.Parent_Hash = this.Head.slice(4,36).toString('hex');
        this.Body_Hash = this.Head.slice(36,68).toString('hex');
        this.Target = this.Head.slice(68,100).toString('hex');
        this.Time_Stamp = this.Head.slice(100,108).readBigUInt64BE(0);
        this.Nonce = this.Head.slice(108,116).readBigInt64BE(0);
        this.Mining_Fees = BigInt(Mining_Fees);
        this.Header_Hash = crypto.createHash('SHA256').update(this.Head).digest('hex');
    }
    get Num_Transactions(){return this.Byte.slice(0,4).readUInt32BE(0);}
    get Transaction_Data(){
        var Data_Arr= [];
        var Buf = this.Byte.slice(4);
        for(var i = 0; i < this.Num_Transactions;i++){
            var Transaction_len = Buf.slice(0,4).readUInt32BE(0);
            var New_Transaction = new transaction(Buf.slice(4,4+Transaction_len));
            Data_Arr.push(New_Transaction);
            Buf = Buf.slice(Transaction_len+4) ;
        }
        return Data_Arr;
    }
    Verify_Transactions(){
        console.log('Verifying Transactions:')
        var flag = true;
        var Block_reward = this.Mining_Fees;
        for(var i = 1; i < this.Num_Transactions;i++){
            Block_reward += this.Transaction_Data[i].Transaction_Fee;
            if(flag) {
                console.log('Transaction'+i+':')
                flag = this.Transaction_Data[i].Verify_Transaction();
            }
        }
        if(this.Transaction_Data[0].Output_Data.Total_coins != Block_reward) {
            flag = false;
            console.log('Wrong Block reward!')
        }

        if(flag){console.log('Transactions Verified!')}
        else{console.log('Transactions not verified!')}

        return flag;
    }

    Display(){
        console.log('Index: ',this.Index);
        console.log('Parent Hash: ',this.Parent_Hash);
        console.log('Body Hash: ',this.Body_Hash);
        console.log('Target Value: ',this.Target);
        console.log('Time Stamp: ',this.Time_Stamp);
        console.log('Nonce: ',this.Nonce);
        console.log('No of Transactions: ',this.Num_Transactions);
        for(var i = 0; i < this.Num_Transactions;i++){this.Transaction_Data[i].Display();}
    }

    Update_Unused_Output(){
        for(var i = 0; i < this.Num_Transactions;i++){this.Transaction_Data[i].Update_Output()}
    }

    Update_Pending_Transactions(Arr){
        var Txns = this.Transaction_Data
        Arr = Arr.filter(function(v) {!Txns.reduce((acc,curr) => acc || (curr.Transaction_ID == v.Transaction_ID),false);})
        return Arr;
    }

    Verify_Block(){
        console.log('Verifying Block:')
        var flag = this.Verify_Transactions();

        console.log('Verifying Parent Hash:')
        if(this.Parent_Hash != Hash(this.Index - 1)){
            flag = false;
            console.log('Hash not verified!')
        }
        else{console.log('Hash verified!')};

        console.log('Verifying Body Hash:')
        if(this.Body_Hash != crypto.createHash('SHA256').update(this.Byte).digest('hex')){
            flag = false;
            console.log('Hash not verified!')
        }
        else{console.log('Hash verified!')}

        console.log('Verifying Nonce:')
        if(crypto.createHash('SHA256').update(this.Head).digest('hex') > this.Target){
            flag = false;
            console.log('Nonce Incorrect!');
        }
        else{console.log('Nonce verified!')}

        if(flag){console.log('Block Verified!')}
        else{console.log('Block not verified!')}

        return flag;
    }
    Update_Output_Map(O_Map){
        var O_map = O_Map;
        for(var i=this.Num_Transactions-1;i>=0;i--) {O_map = this.Transaction_Data[i].update_Output_Map(O_map)};
        return O_map;
    }


}
module.exports = Block;