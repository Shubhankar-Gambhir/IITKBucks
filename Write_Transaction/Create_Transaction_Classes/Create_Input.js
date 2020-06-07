const prompt = require('prompt-sync')({sigint: true});
const crypto = require('crypto')
class input{
    constructor(Hash,Key){
        this.Output_Hash = Hash;
        this.Key = Key;
    }
    Transaction_ID = prompt('    Transaction_ID: ');
    Index = Number(prompt('    Index: '));
    Signature_length = Buffer.byteLength(this.Signature,"hex")
    get Signature(){
        var Tbuf = Buffer.alloc(32,this.Transaction_ID,'hex');
        var Ibuf = Buffer.alloc(4);
        Ibuf.writeUInt32BE(this.Index,0,4);
        var Hbuf = Buffer.alloc(32,this.Output_Hash,'hex');
        var arr = [Tbuf,Ibuf,Hbuf];
        var byte = Buffer.concat(arr);
        const sign = crypto.createSign('SHA256').update(byte).sign({key: Key, padding:crypto.constants.RSA_PKCS1_PSS_PADDING},'hex')
        return sign;
    }
    get Buffer(){
        var Tbuf = Buffer.alloc(32,this.Transaction_ID,'hex');
        var Ibuf = Buffer.alloc(4);
        Ibuf.writeUInt32BE(this.Index,0,4);
        var Lbuf = Buffer.alloc(4);
        Lbuf.writeUInt32BE(this.Signature_length,0,4);
        var Sbuf = Buffer.alloc(this.Signature_length,this.Signature,'hex');
        var arr = [Tbuf,Ibuf,Lbuf,Sbuf] ;
        var buf = Buffer.concat(arr);
        return buf; 
    }
}

module.exports = input;
