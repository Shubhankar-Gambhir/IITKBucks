const crypto = require('crypto');

const Input_Data = require('./Input_Data');
const Output_Data = require('./Output_Data');

class transaction{
    constructor(inputs,outputs,flag,key){
        this.Output_Data = new Output_Data(outputs);
        this.Output_Hash = crypto.createHash('SHA256').update(this.Output_Data.Buffer).digest('hex');
        this.Input_Data = new Input_Data(this.Output_Hash,inputs,flag,key);
        this.Transaction_Fee = this.Input_Data.Total_Coins - this.Output_Data.Total_Coins ;
        this.Buf = Buffer.from([...this.Input_Data.Buffer,...this.Output_Data.Buffer]);
        this.ID = crypto.createHash('SHA256').update(this.Buf).digest('hex');
        this.Size = this.Buf.byteLength;    //Size in bytes
        this.Fee_to_Size_Ratio = Number(parseInt(this.Transaction_Fee.toString())/this.Size);
        this.JSON = {"inputs": this.Input_Data.inputs_Arr,"outputs":this.Output_Data.outputs_Arr};
    }
    update_Output_Map(map){
        var O_map = this.Input_Data.Update_Output_Map(map);
        O_map = this.Output_Data.Update_Output_Map(O_map,this.ID);
        return O_map;
    }
}

module.exports = transaction;