const funcs = require('./function')
const prompt = require('prompt-sync')({sigint: true})

var url = prompt("Enter url: ")
var todo = prompt('What do you want to do? ');
while(!['add Alias','generate Keys','get Balance','Transfer'].includes(todo)){
    console.log(todo);
    todo = prompt('What do you want to do? ');
}
switch(todo){
    case 'add Alias':
        funcs.add_Alias(url,null);
        break;
    case 'generate Key':
        funcs.generate_Keys();
        break;
    case 'get Balance':
        funcs.check_Balance(url,null).then(function(a){console.log(a.balance)});
        break;
    case 'Transfer':
        funcs.make_transaction(url);
        break;
}
