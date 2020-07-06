const crypto = require('crypto');
const JSONbig = require('json-bigint')

const Input_Data = require('./Input_Data');
const Output_Data = require('./Output_Data');

class transaction{
    constructor(inputs,outputs,flag,person){
        this.Output_Data = new Output_Data(outputs);           
        this.JSON = JSONbig.parse(JSONbig.stringify({                       //JSON format data
            "inputs": inputs,
            "outputs": outputs
        }));
        this.Output_Hash = crypto.createHash('SHA256').update(this.Output_Data.Buffer).digest('hex');
        this.Input_Data = new Input_Data(this.Output_Hash,inputs,flag,person);    
        this.Transaction_Fee = this.Input_Data.Total_Coins - this.Output_Data.Total_Coins ;
        this.Buf = Buffer.from([...this.Input_Data.Buffer,...this.Output_Data.Buffer]);
        this.ID = crypto.createHash('SHA256').update(this.Buf).digest('hex');
        this.Size = this.Buf.byteLength;    //Size in bytes
        this.Fee_to_Size_Ratio = Number(parseInt(this.Transaction_Fee.toString())/this.Size);
    }
}

module.exports = transaction;