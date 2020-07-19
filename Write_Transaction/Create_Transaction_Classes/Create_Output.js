const prompt = require('prompt-sync')({sigint: true});
const fs = require('fs');

class output{
    constructor(output){
        this.Coins = BigInt(output.amount);
        this.Public_key = output.recipient;
        this.Length = Buffer.byteLength(this.Public_key,"utf-8");
        this.json = {
            "amount": this.Coins.toString(),
            "recipient": this.Public_key
        }
    }
    
    get Buffer(){
        var biguint = BigInt(this.Coins);
        var Cbuf = Buffer.alloc(8);
        Cbuf.writeBigUInt64BE(biguint,0,8);
        var Lbuf = Buffer.alloc(4);
        Lbuf.writeUInt32BE(this.Length,0,32);
        var Pbuf = Buffer.alloc(this.Length,this.Public_key,"utf-8");
        var buf = Buffer.concat([Cbuf,Lbuf,Pbuf]);

        return buf;
    }
    Update_Output_Map(O_Map,i,id){
        var transactionId = id;
        var index = Number(i);
        var amount = this.Coins; 
        var output = {transactionId,index,amount};
        var arr = O_Map.has(this.Public_key) ? O_Map.get(this.Public_key):[];
        arr.push(output);
        O_Map.set(this.Public_key,arr);
        return(O_Map);
    }
}

module.exports = output;