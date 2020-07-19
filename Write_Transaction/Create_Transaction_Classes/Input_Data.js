const input = require('./Create_Input');

class Input_Data{
    constructor(hash,inputs,flag,key){
        this.Num_Input = inputs.length;     //number of inputs
        this.inputs = inputs;               //input array
        this.Create_Sign = flag;            //;wether to create own signature
        this.Hash = hash
        this.Key = key;
    }

    get Input_Data_Arr(){
        var arr = [],key = this.Key
        for (var i = 0;i < this.Num_Input;i++){
            var new_Input = new input(this.Hash,this.inputs[i],this.Create_Sign,key);
            arr.push(new_Input);
        }
        return arr;
    }

    get Total_Coins(){
        var Coins = BigInt(0)
        for (var i = 0;i < this.Num_Input;i++){Coins += this.Input_Data_Arr[i].Coins ;}
        return Coins ;
    }

    get Buffer(){
        var Input_buf = Buffer.alloc(4);
        Input_buf.writeUInt32BE(this.Num_Input,0,4);
        var arr = [Input_buf];
        for (var i = 0;i < this.Num_Input;i++){arr.push(this.Input_Data_Arr[i].Buffer);}
        var Arr = Buffer.concat(arr);
        return Buffer.from(Arr);
    }
    get inputs_Arr(){
        var Arr = []
        for (var i = 0;i < this.Num_Input;i++){Arr.push(this.Input_Data_Arr[i].json);}
        return Arr ;
    }

    Update_Output_Map(O_Map){
        var Output_Map = O_Map;
        for(var i = 0;i < this.Num_Input;i++){Output_Map = this.Input_Data_Arr[i].Update_Output_Map(Output_Map)}
        return Output_Map;
    }
}

module.exports = Input_Data;