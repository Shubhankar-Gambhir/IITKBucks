## Read_Transaction
It reads the .dat file which has the transaction in Binary format

To run
```
$ node read.js
```
and then input the name of Transaction File

It will verify Transaction
* All its inputs exist in our File of unused outputs.
* All the signatures are correct.
* It doesn't spend more coins than it is allowed to.

After Verification
* It will update our file [Unused_Outputs.txt](https://github.com/Shubhankar-Gambhir/IITKBucks/blob/c74183deb48233914beb335c80c6f8dbec92eca5/Unused_Outputs.txt) by adding new outputs and removing the outputs used as inputs.


