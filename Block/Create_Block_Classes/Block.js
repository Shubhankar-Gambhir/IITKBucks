const crypto = require('crypto');
const now = require('nano-time')
const func = require('../../Server/function');
const Hash = func.get_Hash;

class Block{
    constructor(Index,Target,Transactions,Folder){
        this.Transactions = Transactions;
        this.Index = Index;
        this.Parent_Hash = Hash(Index - 1,Folder);
        this.Body_Hash = crypto.createHash('SHA256').update(this.Block_Body.slice(116)).digest('hex');
        this.Target = Target;
        this.Nonce = this.Header_Buf.slice(108,116).readBigUInt64BE(0).toString();
        this.Time_Stamp = this.Header_Buf.slice(100,108).readBigUInt64BE(0).toString();
        this.Block_Buf = Buffer.concat([this.Header_Buf,this.Block_Body]);
        
    }
    get Block_Body(){
        var Buf = Buffer.alloc(4);
        Buf.writeUInt32BE(this.Transactions.length);
        var Arr = [Buf];
        for( let txn of this.Transactions){
            Buf = Buffer.alloc(4)
            Buf.writeUInt32BE(txn.Size,0,4);
            Buf = Buffer.concat([Buf,txn.Buf]);
            Arr.push(Buf)
        }
        Arr = Buffer.concat(Arr);
        return Arr;
    }

    Buf(i){
        var Index_buf = Buffer.alloc(4);
        Index_buf.writeUInt32BE(this.Index,0,4);
        var Parent_Hash_buf = Buffer.alloc(32,this.Parent_Hash,'hex');
        var Body_Hash_buf = Buffer.alloc(32,this.Body_Hash,'hex');
        var Target_Hash_buf = Buffer.alloc(32,this.Target,'hex');
        var Time_Stamp_buf = Buffer.alloc(8);
        Time_Stamp_buf.writeBigUInt64BE(BigInt(now.micro()),0,8);   
        var Nonce_buf = Buffer.alloc(8);
        Nonce_buf.writeBigUInt64BE(BigInt(i),0,4);
        var arr = [Index_buf,Parent_Hash_buf,Body_Hash_buf,Target_Hash_buf,Time_Stamp_buf,Nonce_buf] ;
        var buf = Buffer.concat(arr);
        return buf; 
    }
    get Header_Buf(){
        var i = 1;
        var hash = crypto.createHash('SHA256').update(this.Buf(i)).digest('hex');
        while(hash > this.Target){
            i += 1;
            hash = crypto.createHash('SHA256').update(this.Buf(i)).digest('hex');
        }
        return this.Buf(i);
    }
} 
module.exports = Block;