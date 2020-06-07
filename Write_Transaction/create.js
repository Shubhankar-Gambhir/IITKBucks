const fs = require('fs');

const transaction = require('./Create_Transaction_Classes/Create_Transaction');
var Key = fs.readFileSync('../PrivateKeys/p1_private.pem')
var Transaction = new transaction(Key);

file = '../Transactions/' + Transaction.ID + '.dat';
fs.createWriteStream(file);
fs.writeFileSync(file,Transaction.Buf);
