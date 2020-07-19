const crypto = require('crypto');
const now = require('nano-time')
const func = require('../../Server/function');
const fs = require('fs');
const Hash = func.get_Hash;

const Transaction = require('../../Write_Transaction/Create_Transaction_Classes/Create_Transaction')

class Block{
    constructor(Index,Target,Transactions,Mining_Fee,key){
        this.Transactions = Transactions;
        this.Index = Index;
        this.Parent_Hash = Hash(Index - 1);
        this.Mining_Fee = BigInt(Mining_Fee);
        this.PublicKey = key;
        this.Target = Target;
        this.Body_Hash = crypto.createHash('SHA256').update(this.Block_Body).digest('hex');
        this.Header_Buf = this.Header;
        this.Nonce = this.Header_Buf.slice(108,116).readBigUInt64BE(0);
        this.Time_Stamp = this.Header_Buf.slice(100,108).readBigUInt64BE(0);
        this.Block_Buf = Buffer.concat([this.Header_Buf,this.Block_Body]);
    }
    get Block_Reward_Txn(){
        var Amt = this.Mining_Fee;
        for(let txn of this.Transactions){Amt += BigInt(txn.Transaction_Fee);}
        var output = {};
        output.amount = Amt;
        output.recipient = this.PublicKey;
        var Txn = new Transaction([],[output],0,this.PublicKey);
        return Txn;
    }

    get Block_Body(){
        var Buf = Buffer.alloc(4);
        var Txn_Arr = [this.Block_Reward_Txn,...this.Transactions];
        Buf.writeUInt32BE(Txn_Arr.length);
        var Arr = [Buf];
        for( let txn of Txn_Arr){
            Buf = Buffer.alloc(4)
            Buf.writeUInt32BE(txn.Size,0,4);
            Buf = Buffer.concat([Buf,Buffer.from(txn.Buf)]);
            Arr.push(Buf);
        }
        var buf = Buffer.concat(Arr);
        return buf;
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
        Nonce_buf.writeBigUInt64BE(BigInt(i),0,8);
        var arr = [Index_buf,Parent_Hash_buf,Body_Hash_buf,Target_Hash_buf,Time_Stamp_buf,Nonce_buf] ;
        var buf = Buffer.concat(arr);

        return buf; 
    }
    get Header(){
        console.log('Mining Started!');
        var i = 1;
        var buff = this.Buf(i)
        var hash = crypto.createHash('SHA256').update(buff).digest('hex');
        while(hash > this.Target){
            i += 1;
            buff = this.Buf(i)
            hash = crypto.createHash('SHA256').update(buff).digest('hex');
        }

        return buff;
    }
} 
module.exports = Block;