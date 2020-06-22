const prompt = require('prompt-sync')({sigint: true});
const fs = require('fs');

class output{
    constructor(output){
        this.Coins = Number(output.amount);
        this.Public_key = output.recipient;
        this.Length = Buffer.byteLength(this.Public_key,"utf-8");
    }
    
    get Buffer(){
        var biguint = BigInt(this.Coins);
        var Cbuf = Buffer.alloc(8).writeBigUInt64BE(biguint,0,8);
        var Lbuf = Buffer.alloc(4).writeUInt32BE(this.Length,0,32);
        var Pbuf = Buffer.alloc(this.Length,this.Public_key,"utf-8");
        var buf = Buffer.concat([Cbuf,Lbuf,Pbuf]);

        return buf;
    }
}

module.exports = output;