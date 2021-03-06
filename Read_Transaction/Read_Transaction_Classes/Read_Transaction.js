const crypto = require('crypto')
const fs = require('fs');
const Input_Data = require('./Input_Data');
const Output_Data = require('./Output_Data');

class transaction{
    constructor(Byte){
        this.Byte = Byte;
        this.Transaction_ID = crypto.createHash('SHA256').update(this.Byte).digest('hex');
        this.Input_Data = new Input_Data(this.Byte);
        this.Output_Data = new Output_Data(this.Input_Data.Remaining_Buf);
    }
    get Transaction_Fee(){return this.Input_Data.Total_coins - this.Output_Data.Total_coins ;}

    Verify_Transaction(){
        var flag = true;

        flag = this.Input_Data.Check_Inputs(flag);
        flag = this.Input_Data.Verify(flag);
        if(this.Transaction_Fee<0){
            flag = false;
            console.log("Spent more coins than used!");
        }

        return flag;
    }
    Update_Output(){
        var New_Output = this.Input_Data.Updated_Map.set(this.Transaction_ID,this.Output_Data.Output_Data_Map);

        for(let [Transaction_ID,Data] of New_Output){
            for(let[Index,Output]  of Data){
                Output = Object.fromEntries(Output);
                Data = New_Output.get(Transaction_ID).set(Index,Output);
            }
            Data = Object.fromEntries(Data);
            New_Output.set(Transaction_ID,Data);
        }

        var Updated_Unused_Output = Object.fromEntries(New_Output);
        
        fs.writeFileSync('../Unused_Outputs.txt',JSON.stringify(Updated_Unused_Output,null,'\t'))
    }
    Display(){
        console.log('Transaction_ID: ',this.Transaction_ID);
        this.Input_Data.Display ;
        this.Output_Data.Display ;
    }
    update_Output_Map(map){
        var O_map = this.Input_Data.Update_Output_Map(map);
        O_map = this.Output_Data.Update_Output_Map(O_map,this.Transaction_ID);
        return O_map;
    }
}

module.exports = transaction;
