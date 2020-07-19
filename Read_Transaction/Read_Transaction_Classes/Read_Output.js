class output{
    constructor(Buf){
        this.Buf = Buf;
        this.Coin = Buf.slice(0,8).readBigUInt64BE(0);
        this.Length = Buf.slice(8,12).readUInt32BE(0);
        this.Key = Buf.slice(12, 12 + this.Length).toString('utf8');
        this.New_buf = Buf.slice(12 + this.Length);
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

    Update_Output_Map(O_Map,i,id){
        var transactionId = id;
        var index = Number(i);
        var amount = this.Coin.toString(); 
        var output = {transactionId,index,amount};
        var arr = O_Map.has(this.Key) ? O_Map.get(this.Key):[];
        arr.push(output);
        O_Map.set(this.Key,arr);
        return(O_Map);
    }
}

module.exports = output;