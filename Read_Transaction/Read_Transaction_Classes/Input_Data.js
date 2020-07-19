const input = require('./Read_Input');
const crypto = require('crypto')
var parseJSON = require('parse-json-object-as-map');
const fs = require('fs')
class Input_Data{
    constructor(Byte){
        this.Byte = Byte;
    }
    get Num_Input(){return this.Byte.slice(0,4).readUInt32BE(0);}
    get Remaining_Buf(){
        if(this.Num_Input){return this.Input_Data_Arr[this.Num_Input-1].New_buf;}
        else{return this.Byte.slice(4);}
    }
    get Input_Data_Arr(){
        var Data_Arr = [];
        var Buf = this.Byte.slice(4);
        for(var i = 0; i < this.Num_Input;i++){
            var New_Input = new input(Buf);
            Data_Arr.push(New_Input);
            Buf = New_Input.New_buf;
        }
        return Data_Arr;
    }
    get Display(){
        console.log('No of Input: ',this.Num_Input);
            for(var i = 0; i < this.Num_Input;i++){this.Input_Data_Arr[i].Display(i);}
    }
    get Total_coins(){
        var Coins = BigInt(0);
        for(var i = 0; i < this.Num_Input;i++){ Coins +=  this.Input_Data_Arr[i].Coins; }
        return Coins;
    }
    get Updated_Map(){
        var Unused_Outputs = parseJSON(fs.readFileSync('../Unused_Outputs.txt').toString().split(','));                        // parsing JSON as map

        for(var i = 0; i < this.Num_Input;i++){                                                                                // updating map by deleting used
            Unused_Outputs.get(this.Input_Data_Arr[i].Transaction_ID).delete(this.Input_Data_Arr[i].Index.toString())          // entries
            if(Unused_Outputs.get(this.Input_Data_Arr[i].Transaction_ID).size == 0){
                Unused_Outputs.delete(this.Input_Data_Arr[i].Transaction_ID);
            }
        }
        return Unused_Outputs;
    }
    Update_Output_Map(O_Map){
        var Output_Map = O_Map;
        for(var i = 0;i < this.Num_Input;i++){Output_Map = this.Input_Data_Arr[i].Update_Output_Map(Output_Map)}
        return Output_Map;
    }
    Verify(flag){
        var Hash_Buf = Buffer.from(crypto.createHash('SHA256').update(this.Remaining_Buf).digest("hex"),'hex');
        for(var i = 0; i < this.Num_Input ;i++){
            if(!this.Input_Data_Arr[i].Verify_Signature(Hash_Buf)){
                flag = false;
                console.log("Input "+i+" Signature not verified!")
            }
        }
        return flag;
    }
    Check_Inputs(flag){
        for(var i = 0; i < this.Num_Input;i++){
            if(!this.Input_Data_Arr[i].Check_Inputs()){
                flag = false;
                console.log("Input "+i+" doesn't exist!")
            }
        }
        return flag;
    }
}

module.exports = Input_Data;