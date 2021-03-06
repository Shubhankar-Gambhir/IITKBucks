const output = require('./Create_Output');

class Output_Data{
    constructor(outputs){
        this.Num_Output = outputs.length;   //number of outputs
        this.outputs = outputs;             //output array
    }

    get Output_Data_Arr(){
        var arr = [];
        for (var i = 0;i < this.Num_Output;i++){
            var new_Output = new output(this.outputs[i]);
            arr.push(new_Output);
        }
        return arr;
    }

    get Total_Coins(){
        var Coins = BigInt(0)
        for (var i = 0;i < this.Num_Output;i++){Coins += this.Output_Data_Arr[i].Coins ;}
        return Coins ;
    }

    get Buffer(){
        var Output_buf = Buffer.alloc(4);
        Output_buf.writeUInt32BE(this.Num_Output,0,4);
        var arr = [Output_buf];
        for (var i = 0;i < this.Num_Output;i++){
            arr.push(this.Output_Data_Arr[i].Buffer);
        }
        var Arr = Buffer.concat(arr)
        return Buffer.from(Arr);
    }
    get outputs_Arr(){
        var Arr = []
        for (var i = 0;i < this.Num_Output;i++){Arr.push(this.Output_Data_Arr[i].json);}
        return Arr ;
    }

    Update_Output_Map(O_Map,id){
        var Output_Map = O_Map;
        for(var i = 0;i < this.Num_Output;i++){Output_Map = this.Output_Data_Arr[i].Update_Output_Map(Output_Map,i,id);}
        return Output_Map;
    }

}
module.exports = Output_Data;