pragma solidity ^0.4.18;

import './Ownable.sol';
import "dev.oraclize.it/api.sol";



contract Waves2EthDARFExchange is Ownable {

    public bytes32 wavesaddr ='' ;



    // Comes request with txID in Waves blockchain
    public function waves2Eth (txID bytes32 )
    {

    // checking TX id in waves node?
    oraclize_setNetwork(networkID_testnet);
    oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
    oraclize_query("URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0");

    // checks transaction did not serve already

    // sends DARF to sender

    //



    }
}





