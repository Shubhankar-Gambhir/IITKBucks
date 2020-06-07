const fs = require('fs');
const crypto = require('crypto')
var parseJSON = require('parse-json-object-as-map');

class input{
    constructor(Buf){
        this.Buf = Buffer.from(Buf);
        this.Unused_Outputs = parseJSON(fs.readFileSync('../Unused_Outputs.txt').toString().split(','));
    }
    get Coins(){
        return BigInt(this.Unused_Outputs.get(this.Transaction_ID).get(this.Index.toString()).get('Coin'));
    }
    get Key(){
        return this.Unused_Outputs.get(this.Transaction_ID).get(this.Index.toString()).get('Key');
    }
    get Transaction_ID(){
        var Tbuf = this.Buf.slice(0,32);
        var ID = Tbuf.toString('hex');
        return ID;
    }
    get Index(){
        var Ibuf = this.Buf.slice(32,36);
        var Ix = Ibuf.readUInt32BE(0);
        return Ix ;
    }
    get New_buf(){
        var Nbuf = this.Buf.slice(40 + this.Signature_length);
        return Nbuf;
    }
    get Signature_length(){
        var Lbuf =  this.Buf.slice(36,40);
        var Len = Lbuf.readUInt32BE(0);
        return Len;
    }
    get Signature(){
        var Sbuf = this.Buf.slice(40,40 +this.Signature_length)
        var Sign = Sbuf.toString('hex');
        return Sign;
    }
    Verify_Signature(Hbuf){
        var byte = this.Buf.slice(0,36);
        byte = [byte,Hbuf];
        byte = Buffer.concat(byte);
        var verify = crypto.createVerify('SHA256');
            verify.write(byte);
            verify.end()
            var verifyRes = verify.verify({key: this.Key, padding:crypto.constants.RSA_PKCS1_PSS_PADDING}, this.Signature,'hex')
            if(verifyRes){return true;}
            else{return false;}        
    }
    Check_Inputs(){
        if(this.Unused_Outputs.has(this.Transaction_ID)){
            if(this.Unused_Outputs.get(this.Transaction_ID).has(this.Index.toString())){return true;}
            else{ return false; }
        }
        else{ return false }
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