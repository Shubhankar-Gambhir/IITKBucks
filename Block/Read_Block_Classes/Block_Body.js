const transaction = require('../../Read_Transaction/Read_Transaction_Classes/Read_Transaction');
const crypto = require('crypto');
const func = require('../../Server/function');
const Hash = func.get_Hash;

class Block{
    constructor(Byte){
        this.Head = Buffer.from(Byte).slice(0,116);
        this.Byte = Buffer.from(Byte).slice(116);
        this.Index = this.Head.slice(0,4).readUInt32BE(0);
        this.Parent_Hash = this.Head.slice(4,36).toString('hex');
        this.Body_Hash = this.Head.slice(36,68).toString('hex');
        this.Target = this.Head.slice(68,100).toString('hex');
        this.Time_Stamp = this.Head.slice(100,108).readBigUInt64BE(0);
        this.Nonce = this.Head.slice(108,116).readBigInt64BE(0);
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
        flag = true;
        for(var i = 1; i < this.Num_Transactions;i++) if(flag) flag = this.Transaction_Data[i].Verify_Transaction();
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
        Arr = Arr.filter(function(item) {return !this.Transaction_Data.includes(item); })
        return Arr;
    }

    Verify_Block(){
        var flag = this.Verify_Transactions();
        if(this.Parent_Hash != Hash(this.Index - 1)){flag = false;}
        if(this.Body_Hash != crypto.createHash('SHA256').update(this.Byte).digest('hex')){flag = false;}
        if(crypto.createHash('SHA256').update(this.Head).digest('hex') > this.Target){flag = false;}

        return flag;
    }


}
module.exports = Block;