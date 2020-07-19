const crypto = require('crypto');
const fs = require('fs');
var parseJSON = require('parse-json-object-as-map');

class input{
    constructor(Hash,input,flag,private_key){
        this.Output_Hash = Hash;
        this.input = input;
        this.Private_key = private_key;
        this.Transaction_ID = input.transactionId;
        this.Index = Number(input.index);
        this.Create_Sign = flag; //wether to create own signature
        this.Signature_length = Buffer.byteLength(this.Signature,"hex");
        this.json = {
            "transactionId": this.Transaction_ID,
            "index": this.Index,
            "signature": this.Signature
        }
    }
    get Unused_Outputs(){ return parseJSON(fs.readFileSync('../Unused_Outputs.txt').toString().split(','));}
    get Coins(){ return BigInt(this.Unused_Outputs.get(this.Transaction_ID).get(this.Index.toString()).get('Coin'));}
    get Key(){ return this.Unused_Outputs.get(this.Transaction_ID).get(this.Index.toString()).get('Key');}

    get Signature(){
        if(this.Create_Sign){
            var Tbuf = Buffer.alloc(32,this.Transaction_ID,'hex');
            var Ibuf = Buffer.alloc(4)
            Ibuf.writeUInt32BE(this.Index,0,4);
            var Hbuf = Buffer.alloc(32,this.Output_Hash,'hex');
            var byte = Buffer.concat([Tbuf,Ibuf,Hbuf]);
            const sign = crypto.createSign('SHA256').update(byte).sign({key: this.Private_key, padding:crypto.constants.RSA_PKCS1_PSS_PADDING,saltLength:32},'hex');
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

    Update_Output_Map(OMap){
        var ID = this.Transaction_ID;
        var index = this.Index
        Arr = Omap.get(this.Key);
        Arr.filter(function(a){
            var c1 = a.transactionId == ID ;
            var c2 = a.index == index;
            return !(c1 && c2);
        });
        OMap.set(this.Key,Arr);
        return OMap;
    }
    Verify_Signature(Hbuf){
        var byte = Buffer.concat([this.Buffer.slice(0,36),Hbuf])
        var verify = crypto.createVerify('SHA256').update(byte).verify({key: this.Key, padding:crypto.constants.RSA_PKCS1_PSS_PADDING,saltLength:32}, this.Signature,'hex')
        return verify;
    }
    Check_Inputs(){
        if(this.Unused_Outputs.has(this.Transaction_ID)){return this.Unused_Outputs.get(this.Transaction_ID).has(this.Index.toString());}
        else{ return false; }
    }
}

module.exports = input;