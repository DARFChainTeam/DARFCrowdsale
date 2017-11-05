pragma solidity ^0.4.11;


import "./Pausable.sol";
import "./PullPayment.sol";
import "./DARFtoken.sol";

/*
  Crowdsale Smart Contract for allcode
  This smart contract collects ETH, and in return emits DARFtoken tokens to the backers
*/
contract Crowdsale is Pausable, PullPayment {
    
    using SafeMath for uint;

  	struct Backer {
		uint weiReceived; // Amount of Ether given
		uint coinSent;
	}

	/*
	* Constants
	*/
	/* Minimum number of DARFtoken to sell */
	uint public constant MIN_CAP = 10000000; // 1,000,000 DARFtokens

	/* Maximum number of DARFtoken to sell */
	uint public constant MAX_CAP = 80000000; // 80,000,000 DARFtokens

	/* Minimum amount to invest */
	uint public constant MIN_INVEST_ETHER = 100 finney;

	/* Crowdsale period */
	uint private constant CROWDSALE_PERIOD = 42 days;

	/* Number of DARFtokens per Ether */
	uint public constant COIN_PER_ETHER = 500; // 500 DARF per ether


	/*
	* Variables
	*/
	/* DARFtoken contract reference */
	DARFtoken public coin;

    /* Multisig contract that will receive the Ether */
	address public multisigEther;

	/* Number of Ether received */
	uint public etherReceived;

	/* Number of DARFtokens sent to Ether contributors */
	uint public coinSentToEther;

	/* Crowdsale start time */
	uint public startTime;

	/* Crowdsale end time */
	uint public endTime;

 	/* Is crowdsale still on going */
	bool public crowdsaleClosed;

	/* Backers Ether indexed by their Ethereum address */
	mapping(address => Backer) public backers;

	/*
	* Modifiers
	*/
	modifier minCapNotReached() {
		require(!((now < endTime) || coinSentToEther >= MIN_CAP ));
		_;
	}

	modifier respectTimeFrame() {
		require(!((now < startTime) || (now > endTime )));
		_;
	}

	/*
	 * Event
	*/
	event LogReceivedETH(address addr, uint value);
	event LogCoinsEmited(address indexed from, uint amount);

	/*
	 * Constructor
	*/
	function Crowdsale(address _DARFtokenAddress, address _to) {
		coin = DARFtoken(_DARFtokenAddress);
		multisigEther = _to;
	}

	/* 
	 * The fallback function corresponds to a donation in ETH
	 */
	function() stopInEmergency respectTimeFrame payable {
		receiveETH(msg.sender);
	}

	/* 
	 * To call to start the crowdsale
	 */
	function start() onlyOwner {
		require (startTime == 0);

		startTime = now ;            
		endTime =  now + CROWDSALE_PERIOD;    
	}

	/*
	 *	Receives a donation in Ether
	*/
	function receiveETH(address beneficiary) internal {
		require(!(msg.value < MIN_INVEST_ETHER)); // Don't accept funding under a predefined threshold
		
		uint coinToSend = bonus(msg.value.mul(COIN_PER_ETHER).div(1 ether)); // Compute the number of DARFtoken to send
		require(!(coinToSend.add(coinSentToEther) > MAX_CAP));	

		 Backer backer = backers[beneficiary];
		coin.transfer(beneficiary, coinToSend); // Transfer DARFtokens right now

		backer.coinSent = backer.coinSent.add(coinToSend);
		backer.weiReceived = backer.weiReceived.add(msg.value); // Update the total wei collected during the crowdfunding for this backer    

		etherReceived = etherReceived.add(msg.value); // Update the total wei collected during the crowdfunding
		coinSentToEther = coinSentToEther.add(coinToSend);

		// Send events
		LogCoinsEmited(msg.sender ,coinToSend);
		LogReceivedETH(beneficiary, etherReceived); 
	}
	

	/*
	 *Compute the DARFtoken bonus according to the investment period
	 */
	function bonus(uint amount) internal constant returns (uint) {
		/*
			25%in the first 15 days
			20% 16 days 18 days
			15% 19 days 21 days
			10% 22 days 24 days
			5% from 25 days to 27 days
			0% from 28 days to 42 days

			*/

		if (now < startTime.add(16 days)) return amount.add(amount.div(4));   // bonus 25%
		if (now < startTime.add(18 days)) return amount.add(amount.div(5));   // bonus 20%
		if (now < startTime.add(22 days)) return amount.add(amount.div(20).mul(3));   // bonus 15%
		if (now < startTime.add(25 days)) return amount.add(amount.div(10));   // bonus 10%
		if (now < startTime.add(28 days)) return amount.add(amount.div(20));   // bonus 5


		return amount;
	}

/*
 * Finalize the crowdsale, should be called after the refund period
*/
	function finalize() onlyOwner public {

		if (now < endTime) { // Cannot finalise before CROWDSALE_PERIOD or before selling all coins
			require (coinSentToEther == MAX_CAP); 
		}

		require(!(coinSentToEther < MIN_CAP && now < endTime + 15 days)); // If MIN_CAP is not reached donors have 15days to get refund before we can finalise

		require(multisigEther.send(this.balance)); // Move the remaining Ether to the multisig address
		
		uint remains = coin.balanceOf(this);
		// No burn all of my precisiossss!
		// if (remains > 0) { // Burn the rest of DARFtokens
		//	require(coin.burn(remains)) ;
		//}
		crowdsaleClosed = true;
	}

	/*	
	* Failsafe drain
	*/
	function drain() onlyOwner {
		require(owner.send(this.balance)) ;
	}

	/**
	 * Allow to change the team multisig address in the case of emergency.
	 */
	function setMultisig(address addr) onlyOwner public {
		require(addr != address(0)) ;
		multisigEther = addr;
	}

	/**
	 * Manually back DARFtoken owner address.
	 */
	function backDARFtokenOwner() onlyOwner public {
		coin.transferOwnership(owner);
	}

	/**
	 * Transfer remains to owner in case if impossible to do min invest
	 */
	function getRemainCoins() onlyOwner public {
		var remains = MAX_CAP - coinSentToEther;
		uint minCoinsToSell = bonus(MIN_INVEST_ETHER.mul(COIN_PER_ETHER) / (1 ether));

		require(!(remains > minCoinsToSell));

		Backer backer = backers[owner];
		coin.transfer(owner, remains); // Transfer DARFtokens right now

		backer.coinSent = backer.coinSent.add(remains);

		coinSentToEther = coinSentToEther.add(remains);

		// Send events
		LogCoinsEmited(this ,remains);
		LogReceivedETH(owner, etherReceived); 
	}


	/* 
  	 * When MIN_CAP is not reach:
  	 * 1) backer call the "approve" function of the DARFtoken token contract with the amount of all DARFtokens they got in order to be refund
  	 * 2) backer call the "refund" function of the Crowdsale contract with the same amount of DARFtokens
   	 * 3) backer call the "withdrawPayments" function of the Crowdsale contract to get a refund in ETH
   	 */
	function refund(uint _value) minCapNotReached public {
		
		require (_value == backers[msg.sender].coinSent) ; // compare value from backer balance

		coin.transferFrom(msg.sender, address(this), _value); // get the token back to the crowdsale contract
		// No burn all of my precisiossss!
		//require (coin.burn(_value)); // token sent for refund are burnt

		uint ETHToSend = backers[msg.sender].weiReceived;
		backers[msg.sender].weiReceived=0;

		if (ETHToSend > 0) {
			asyncSend(msg.sender, ETHToSend); // pull payment to get refund in ETH
		}
	}

}