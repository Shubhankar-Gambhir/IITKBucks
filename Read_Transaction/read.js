const fs = require('fs');
const prompt = require('prompt-sync')({sigint: true});


const transaction = require('./Read_Transaction_Classes/Read_Transaction');

var file = prompt('Enter File path: ');
var Byte = fs.readFileSync(file);
var Transaction = new transaction(Byte);
if(Transaction.Verify_Transaction()){
    Transaction.Store_Output();  
}
//Transaction.Display();

