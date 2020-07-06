const crypto = require('crypto');
const fs = require('fs');
var parseJSON = require('parse-json-object-as-map');

class input{
    constructor(Hash,input,flag,person){
        this.Output_Hash = Hash;
        this.input = input;
        this.Transaction_ID = input.transactionID;
        this.Index = Number(input.index);
        this.Create_Sign = flag; //wether to create own signature
        this.Signature_length = Buffer.byteLength(this.Signature,"hex");
        this.Person = person;
    }
    get Unused_Outputs(){ return parseJSON(fs.readFileSync('../Unused_Outputs.txt').toString().split(','));}
    get Coins(){ return BigInt(this.Unused_Outputs.get(this.Transaction_ID).get(this.Index.toString()).get('Coin'));}
    
    get Signature(){
        if(this.Create_Sign){
            var Tbuf = Buffer.alloc(32,this.Transaction_ID,'hex');
            var Ibuf = Buffer.alloc(4).writeUInt32BE(this.Index,0,4);
            var Hbuf = Buffer.alloc(32,this.Output_Hash,'hex');
            var byte = Buffer.concat([Tbuf,Ibuf,Hbuf]);
            var Key_file = __filename.split('IITKBucks')[0].toString() + 'IITKBucks/Write_Transactions/Private_Keys/' + this.Person + '.pem';
            var Key = fs.readFileSync(Key_file);
            const sign = crypto.createSign('SHA256').update(byte).sign({key: Key, padding:crypto.constants.RSA_PKCS1_PSS_PADDING},'hex');
            return sign;
        }
        else{return this.input.signature;}
    }
    get Buffer(){
        var Tbuf = Buffer.alloc(32,this.Transaction_ID,'hex');
        var Ibuf = Buffer.alloc(4);
        Ibuf.writeUInt32BE(this.Index,0,4);
        var Lbuf = Buffer.alloc(4);
        Lbuf.writeUInt32BE(this.Signature_length,0,4);
        var Sbuf = Buffer.alloc(this.Signature_length,this.Signature,'hex');
        var buf = Buffer.concat([Tbuf,Ibuf,Lbuf,Sbuf]);
        return buf; 
    }
}

module.exports = input;