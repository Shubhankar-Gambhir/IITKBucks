const crypto = require('crypto');
const Block = require('../Block/Create_Block_Classes/Block')
const JSONbig = require('json-bigint')

async function start_mining(Index,Target,Transactions,Mining_Fee,key){
    var block  = new Block(Index,Target,Transactions,Mining_Fee,key);
    return block.Block_Buf;
}

process.on('message', async (message) => {
    message = JSONbig.parse(message);
    var buffer = await start_mining(message.Index,message.Target,message.Transactions,message.Mining_Fee,message.key)
    .catch(function(err){console.error(err)})
    console.log('Mining Completed');
    process.send({ Buffer: buffer});
    process.exit();
});

