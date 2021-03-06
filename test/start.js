var DARFtoken = artifacts.require("./DARFtoken.sol");
var Crowdsale = artifacts.require("./Crowdsale.sol");

var TOTAL_COINS =   84000000000000000000000000;
var CROWDSALE_CAP = 8000000000000000000000000;


contract('start', function(accounts) {

    var eth = web3.eth;
    var owner = "0x33915c9a9c4ed55685584c90701ed9f7b5091ca5";
    var wallet = "0x507bc16480b2f4ebfbc8a97a337c4c09fc754be3";
    var buyer = "0xf71260Be31DC3c437dd90f91E7D71eaAAa4E0a8e";
    var thief = "0xf71260Be31DC3c437dd90f91E7D71eaAAa4E0a8e";

//    web3.personal.unlockAccount("0x33915c9a9c4ed55685584c90701ed9f7b5091ca5", "test12345", 15000);

    function printBalance() {
        const ownerBalance = web3.eth.getBalance(owner);
        const walletBalance = web3.eth.getBalance(wallet);
//        const buyerBalance = web3.eth.getBalance(buyer);

        const crowdsaleBalance = web3.eth.getBalance(Crowdsale.address);


        // console.log("Owner balance", web3.fromWei(ownerBalance, "ether").toString(), " ETHER");
        console.log("Wallet balance", web3.fromWei(walletBalance, "ether").toString(), " ETHER");
        // console.log("Buyer balance", web3.fromWei(buyerBalance, "ether").toString(), " ETHER");
        // console.log("Crowdsale balance", web3.fromWei(crowdsaleBalance, "ether").toString(), " ETHER");


        return DARFtoken.deployed().then(function (instance) {
            return instance.balanceOf.call(owner)
                .then(function (balance) {
                    console.log("Owner balance: ", web3.fromWei(ownerBalance, "ether").toString(), " ETHER / ", balance.valueOf(), " DARF");
                  // return instance.balanceOf.call(buyer);
                }).then(function (balance) {
                  //  console.log("Buyer balance: ", web3.fromWei(buyerBalance, "ether").toString(), " ETHER / ", balance.valueOf(), " DARF");
                    return instance.balanceOf.call(Crowdsale.address);
                }).then(function (balance) {
                    console.log("Crowdsale balance: ", web3.fromWei(crowdsaleBalance, "ether").toString(), " ETHER / ", balance.valueOf(), " DARF");
                })

        })


    }

    it("should put TOTAL_COINS DARFtoken in the owner account", function () {
        return printBalance().then(function () {
            return DARFtoken.deployed().then(function (instance) {
                return instance.balanceOf.call(owner);
            }).then(function (balance) {
                assert.equal(balance.valueOf(), TOTAL_COINS, "TOTAL_COINS wasn't in the owner account.");
            });
        })
    });

    it("Send DARFtoken to Crowdsale contract", function () {
        return DARFtoken.deployed().then(function (coin) {
            return coin.transfer(Crowdsale.address, CROWDSALE_CAP, {from: owner}).then(function (txn) {
                return coin.balanceOf.call(Crowdsale.address);
            });
        }).then(function (balance) {
            console.log("Crowdsale balance: " + balance);
            assert.equal(balance.valueOf(), CROWDSALE_CAP, "CROWDSALE_CAP wasn't in the Crowdsale account");
        });
    });

    it("Set team wallet", function () {
        return Crowdsale.deployed().then(function (crowd) {
            return crowd.setMultisig.call(wallet).then(function () {
                console.log("Team wallet was set to " + wallet);
            });
        });
    });
    it("Start Crowdsale contract", function () {
        return Crowdsale.deployed().then(function (crowd) {
            return crowd.start({from: owner}).then(function () {
                console.log("Crowdsale started.");
            });
        });
    });

});
