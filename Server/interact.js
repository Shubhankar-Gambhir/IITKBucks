const funcs = require('./function')
const prompt = require('prompt-sync')({sigint: true})

var url = prompt("Enter url: ")
console.log('Options: ',['add Alias','generate Keys','get Balance','Transfer']);
var todo = prompt('What do you want to do? ');
while(!['add Alias','generate Keys','get Balance','Transfer'].includes(todo)){
    console.log('Options: ',['add Alias','generate Keys','get Balance','Transfer']);
    todo = prompt('What do you want to do? ');
}
switch(todo){
    case 'add Alias':
        funcs.add_Alias(url,null);
        break;
    case 'generate Keys':
        funcs.generate_Keys();
        break;
    case 'get Balance':
        funcs.check_Balance(url,null).then(function(a){console.log(a.balance)});
        break;
    case 'Transfer':
        funcs.make_transaction(url);
        break;
}
