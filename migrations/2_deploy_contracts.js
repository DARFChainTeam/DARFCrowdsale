var SafeMath = artifacts.require("./SafeMath.sol");
var DARFtoken = artifacts.require("./DARFtoken.sol");
var Crowdsale = artifacts.require("./Crowdsale.sol");


module.exports = function(deployer) {

	//owner of the crowdsale
	 // var owner ='0x00E417f2aD0018A84d1cFe4432657418e10C0d94';  //
	var owner = web3.eth.accounts[0];

	var wallet = web3.eth.accounts[1]; //wallet where the ehter will get deposited
	//var wallet = '0xD72258A9072AE6fC4265743ddd46978b5B66175F';//web3.eth.accounts[1];

	console.log("Owner address: " + owner);	
	console.log("Wallet address: " + wallet);	

	//deploy SafeMath from the owner of the crowdsale
	deployer.deploy(SafeMath, { from: owner });

	//link SafeMath to DARFtoken
	deployer.link(SafeMath, DARFtoken);
	//deploy the DARFtoken using the owner account
	return deployer.deploy(DARFtoken, { from: owner }).then(function() {
		//log the address of the DARFtoken
		console.log("DARFtoken address: " + DARFtoken.address);
                console.log("SafeMathAddress: "+ SafeMath.address);
		//deploy the Crowdsale 
		return deployer.deploy(Crowdsale, DARFtoken.address, wallet, { from: owner }).then(function() {
			console.log("Crowdsale address: " + Crowdsale.address);
			return DARFtoken.deployed().then(function(coin) {
				return coin.owner.call().then(function(owner) {
					console.log("DARFtoken owner : " + owner);
					return coin.transferOwnership(Crowdsale.address, {from: owner}).then(function(txn) {
						console.log("DARFtoken owner was changed: " + Crowdsale.address);
					});
				})
			});
		});
	});
};