It has 4 files: 

  **1) [function.js](https://github.com/Shubhankar-Gambhir/IITKBucks/blob/master/Server/function.js)** : It has all the functions that are used in other files.
  
  **2) [interact.js](https://github.com/Shubhankar-Gambhir/IITKBucks/blob/master/Server/interact.js)** : It is for interaction of user with a known server.
   User can:
   * add Alias
   * generate Keys
   * get Balance
   * Transfer
   
   **3) [mine.js](https://github.com/Shubhankar-Gambhir/IITKBucks/blob/master/Server/mine.js)** : It is for mining a block. It is run parallely on a different thread than server so that our server can accept requests while mining.
   
   **4) [server.js](https://github.com/Shubhankar-Gambhir/IITKBucks/blob/master/Server/server.js** : It is the server (/backend) and acts as a node, it mines blocks regularly and adds them to blockchain.
   
   
