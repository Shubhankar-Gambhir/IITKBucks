const prompt = require('prompt-sync')({sigint: true});
const crypto = require('crypto');
const fs = require('fs');
class input{
    constructor(Hash,input,flag){arr
        this.Output_Hash = Hash;
        this.Transaction_ID = input.transactionID;
        this.Index = Number(input.index);
        this.Create_Sign = flag; //wether to create own signature
    }
    Signature_length = Buffer.byteLength(this.Signature,"hex");
    get Signature(){
        if(flag){
            var Tbuf = Buffer.alloc(32,this.Transaction_ID,'hex');
            var Ibuf = Buffer.alloc(4).writeUInt32BE(this.Index,0,4);
            var Hbuf = Buffer.alloc(32,this.Output_Hash,'hex');
            var byte = Buffer.concat([Tbuf,Ibuf,Hbuf]);
            var Key = fs.readFileSync('./Private_Keys/p1_private.pem');// write key here
            const sign = crypto.createSign('SHA256').update(byte).sign({key: Key, padding:crypto.constants.RSA_PKCS1_PSS_PADDING},'hex');
            return sign;
        }
        else{return input.signature;}
    }
    get Buffer(){
        var Tbuf = Buffer.alloc(32,this.Transaction_ID,'hex');
        var Ibuf = Buffer.alloc(4).writeUInt32BE(this.Index,0,4);
        var Lbuf = Buffer.alloc(4).writeUInt32BE(this.Signature_length,0,4);
        var Sbuf = Buffer.alloc(this.Signature_length,this.Signature,'hex');
        var buf = Buffer.concat([Tbuf,Ibuf,Lbuf,Sbuf]);
        return buf; 
    }
}

module.exports = input;