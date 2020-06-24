const crypto = require('crypto');

const input = require('./Create_Input');
const output = require('./Create_Output');

class transaction{
    constructor(inputs,outputs,flag){
        this.Num_Input = inputs.length;     //number of inputs
        this.Num_Output = outputs.length;   //number of outputs
        this.inputs = inputs;               //input array
        this.outputs = outputs;             //output array
        this.Create_Sign = flag;            //wether to create own signature
        this.JSON = {                       //JSON format data
            "inputs": this.inputs,
            "outputs": this.outputs
        };
        this.ID = crypto.createHash('SHA256').update(this.Buf).digest('hex');
        this.Size = this.Buf.byteLength;    //Size in bytes
    }

    get Input_Data(){
        var Hash = crypto.createHash('SHA256').update(this.Output_Data).digest('hex');
        var arr = [];
        for (var i = 0;i < this.Num_Input;i++){
            var new_Input = new input(Hash,this.inputs[i],this.Create_Sign);
            arr.push(new_Input.Buffer);
        }
        return Buffer.concat(arr);
    }
    get Output_Data(){
        var Output_buf = Buffer.alloc(4);
        Output_buf.writeUInt32BE(this.Num_Output,0,4);
        var arr = [Output_buf];
        for (var i = 0;i < this.Num_Output;i++){
            var new_Output = new output(this.outputs[i]);
            arr.push(new_Output.Buffer);
        }
        return Buffer.concat(arr);
    }
    get Buf(){
        var Input_buf = Buffer.alloc(4);
        Input_buf.writeUInt32BE(this.Num_Input,0,4);
        var Output_buf = Buffer.alloc(4);
        Output_buf.writeUInt32BE(this.Num_Output,0,4);
        var buf = [Input_buf,this.Input_Data,this.Output_Data];
        buf = Buffer.concat(buf);
        return buf;
    }
}

module.exports = transaction;