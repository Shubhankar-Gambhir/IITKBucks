## Read_Transaction
It has class that take data in binary format and give details of transactions. 

### It has follwing methods:

#### 1) Verify Transaction:
* All its inputs exist in our File of unused outputs.
* All the signatures are correct.
* It doesn't spend more coins than it is allowed to.

After Verification

#### 2) Update Unused_Outputs:
* It will update our file [Unused_Outputs.txt](https://github.com/Shubhankar-Gambhir/IITKBucks/blob/c74183deb48233914beb335c80c6f8dbec92eca5/Unused_Outputs.txt) by adding new outputs and removing the outputs used as inputs.

#### 3) Update Output_Map:
* It will update Output map which has key wise unused outputs in the sae way as previous one by adding new outputs and removing the outputs used as inputs.

##### 4) Dispay:
 * It will display the Transaction in the following format:
 ```
Transaction ID: <in hex format>
Number of inputs: <an integer>
    Input 1:
        Transaction ID: <in hex format>
        Index: <an integer>
        Length of the signature: <an integer>
        Signature: <in hex format>
    Input 2:
        Transaction ID: <in hex format>
        Index: <an integer>
        Length of the signature: <an integer>
        Signature: <in hex format>
    ...
Number of outputs: <an integer>
    Output 1:
        Number of coins: <an integer>
        Length of public key: <an integer>
        Public key: <in PEM format>
    Output 2:
        Number of coins: <an integer>
        Length of public key: <an integer>
        Public key: <in PEM format>
    ...
   ```
 
 It will be used in reading a Block


