const prompt = require('prompt-sync')({sigint: true});
const fs = require('fs');

class output{
    Coins = Number(prompt('    Coins: '));
    Public_key_path = prompt('    Public_key file: ');
    Public_key = fs.readFileSync(this.Public_key_path)
    Length = Buffer.byteLength(this.Public_key,"utf-8")

    get Buffer(){
        var biguint = BigInt(this.Coins);
        var Cbuf = Buffer.alloc(8);
        Cbuf.writeBigUInt64BE(biguint,0,8);
        var Lbuf = Buffer.alloc(4);
        Lbuf.writeUInt32BE(this.Length,0,32);
        var Pbuf = Buffer.alloc(this.Length,this.Public_key,"utf-8");
        var arr = [Cbuf,Lbuf,Pbuf] ;

        var buf = Buffer.concat(arr);

        return buf;
    }
}

module.exports = output;