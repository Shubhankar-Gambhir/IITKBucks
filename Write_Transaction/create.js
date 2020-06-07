const fs = require('fs');

const transaction = require('./Create_Transaction_Classes/Create_Transaction');

var Transaction = new transaction();

file = '../Transactions/' + Transaction.ID + '.dat';
fs.createWriteStream(file);
fs.writeFileSync(file,Transaction.Buf);