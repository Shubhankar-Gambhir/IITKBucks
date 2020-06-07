const output = require('./Read_Output');

class Output_Data{
    constructor(Byte){
        this.Byte = Byte;
    }

    get Num_Output(){
         return this.Byte.slice(0,4).readUInt32BE(0);
    }
    get Output_Data_Arr(){
        var Data_Arr= [];
        var Buf = this.Byte.slice(4);
        for(var i = 0; i < this.Num_Output;i++){
            var New_Output = new output(Buf);
            Data_Arr.push(New_Output);
            Buf = New_Output.New_buf ;
        }
        return Data_Arr;
    }
    get Display(){
        console.log('No of Output: ',this.Num_Output);
            for(var i = 0; i < this.Num_Output;i++){this.Output_Data_Arr[i].Display(i);}
    }
    get Total_coins(){
         var Coins = BigInt(0)
        for(var i = 0; i < this.Num_Output;i++){Coins +=  this.Output_Data_Arr[i].Coin;}
        return Coins;
    }
    get Output_Data_Map(){
        var Output_Map = new Map();
        for(var i = 0; i < this.Num_Output;i++){Output_Map.set(i+1,this.Output_Data_Arr[i].Output_Map);}
        return Output_Map;
    }
}

module.exports = Output_Data;