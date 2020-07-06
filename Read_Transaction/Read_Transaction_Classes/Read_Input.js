const fs = require('fs');
const crypto = require('crypto')
var parseJSON = require('parse-json-object-as-map');

class input{
    constructor(Buf){
        this.Buf = Buffer.from(Buf);
        this.Transaction_ID = Buf.slice(0,32).toString('hex');
        this.Index = Buf.readUInt32BE(32);
        this.Signature_length =  Buf.readUInt32BE(36);
        this.Signature = Buf.slice(40,40 +this.Signature_length).toString('hex');
    }
    
    get Unused_Outputs(){ return parseJSON(fs.readFileSync('../Unused_Outputs.txt').toString().split(','));}
    get New_buf(){ return this.Buf.slice(this.Signature_length+40);}
    get Coins(){ return BigInt(this.Unused_Outputs.get(this.Transaction_ID).get(this.Index.toString()).get('Coin'));}
    get Key(){return this.Unused_Outputs.get(this.Transaction_ID).get(this.Index.toString()).get('Key');}

    Verify_Signature(Hbuf){
        var byte = Buffer.concat([this.Buf.slice(0,36),Hbuf])
        var verify = crypto.createVerify('SHA256').update(byte).verify({key: this.Key, padding:crypto.constants.RSA_PKCS1_PSS_PADDING}, this.Signature,'hex')
        return verify;        
    }
    Check_Inputs(){
        if(this.Unused_Outputs.has(this.Transaction_ID)){return this.Unused_Outputs.get(this.Transaction_ID).has(this.Index.toString());}
        else{ return false; }
    }
    Display(i){
        console.log('   Input ',i+1,': ');
        console.log('       Transaction ID: ',this.Transaction_ID);
        console.log('       Index: ',this.Index);
        console.log('       Length of the signature: ',this.Signature_length);
        console.log('       Signature: ',this.Signature);
    }
}

module.exports = input;