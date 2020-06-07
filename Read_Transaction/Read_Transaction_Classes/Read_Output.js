class output{
    constructor(Buf){
        this.Buf = Buf;
    }
    get Coin(){
        var Cbuf =  this.Buf.slice(0,8);
        var Coins = Cbuf.readBigUInt64BE(0);
        return Coins ;
    }
    get Length(){
        var Lbuf =  this.Buf.slice(8,12);
        var Len = Lbuf.readUInt32BE(0);
        return Len;
    }
    get Key(){
        var Pbuf = this.Buf.slice(12, 12 + this.Length);
        var P_Key = Pbuf.toString('utf8');
        return P_Key;
    }
    get New_buf(){
        var Nbuf = this.Buf.slice(12 + this.Length);
        return Nbuf;
    }
    get Output_Map(){
        var Obj =  new Map();
        Obj.set('Coin',this.Coin.toString())
        Obj.set('Key',this.Key.toString());
        return Obj;
    }
    Display(i){
        console.log('   Output ',i+1,': ');
        console.log('       Number of Coins:',Number(this.Coin));
        console.log('       Length of the public Key: ',this.Length)
        console.log('       Public key: ',this.Key);
    }  
}

module.exports = output;