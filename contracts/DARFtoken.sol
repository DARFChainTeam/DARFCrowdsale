pragma solidity ^0.4.11;

import "./StandardToken.sol";
import "./Ownable.sol";


/**
 *  DARFtoken token contract. Implements
 */
contract DARFtoken is StandardToken, Ownable {
  string public constant name = "DARFtoken";
  string public constant symbol = "DAR";
  uint public constant decimals = 18;


  // Constructor
  function DARFtoken() {
      totalSupply = 84000000;
      balances[msg.sender] = totalSupply; // Send all tokens to owner
  }

  /**
   *  Burn away the specified amount of DARFtoken tokens
   */
  function burn(uint _value) onlyOwner returns (bool) {
    balances[msg.sender] = balances[msg.sender].sub(_value);
    totalSupply = totalSupply.sub(_value);
    Transfer(msg.sender, 0x0, _value);
    return true;
  }

}






