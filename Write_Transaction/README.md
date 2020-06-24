## Write_Transaction
creates a .dat file which has transaction encoded in binary format and stores in Transactions Folder

To run
```
$ node create.js
```
### Note
You can use Dummy Users by using private keys p2_private.pem and p3_private.pem in 
[Create_Input.js](https://github.com/Shubhankar-Gambhir/IITKBucks/blob/d1861c8fa78ee307cc3963141a878f2f8545153b/Write_Transaction/Create_Transaction_Classes/Create_Input.js#L18)
```
        var Key = fs.readFileSync('./Private_Keys/p1_private.pem');// write key here
```
        
