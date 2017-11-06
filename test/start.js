var DARFtoken = artifacts.require("./DARFtoken.sol");
var Crowdsale = artifacts.require("./Crowdsale.sol");

var TOTAL_COINS = 84000000;
var CROWDSALE_CAP = 80000000;
var DARF_PER_ETHER = 500;
var PERIOD_2_DAYS = 2*24*60*60;

contract('start', function(accounts) {

    var eth = web3.eth;
    var owner = eth.accounts[0];
    var wallet = eth.accounts[1];
    var buyer = eth.accounts[2];
    var thief = eth.accounts[3];


    function printBalance() {
        const ownerBalance = web3.eth.getBalance(owner);
        const walletBalance = web3.eth.getBalance(wallet);
        const buyerBalance = web3.eth.getBalance(buyer);
        const crowdsaleBalance = web3.eth.getBalance(Crowdsale.address);

        // console.log("Owner balance", web3.fromWei(ownerBalance, "ether").toString(), " ETHER");
        console.log("Wallet balance", web3.fromWei(walletBalance, "ether").toString(), " ETHER");
        // console.log("Buyer balance", web3.fromWei(buyerBalance, "ether").toString(), " ETHER");
        // console.log("Crowdsale balance", web3.fromWei(crowdsaleBalance, "ether").toString(), " ETHER");


        return DARFtoken.deployed().then(function (instance) {
            return instance.balanceOf.call(owner)
                .then(function (balance) {
                    console.log("Owner balance: ", web3.fromWei(ownerBalance, "ether").toString(), " ETHER / ", balance.valueOf(), " DARF");
                    return instance.balanceOf.call(buyer);
                }).then(function (balance) {
                    console.log("Buyer balance: ", web3.fromWei(buyerBalance, "ether").toString(), " ETHER / ", balance.valueOf(), " DARF");
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

    it("Start Crowdsale contract", function () {
        return Crowdsale.deployed().then(function (crowd) {
            return crowd.start({from: owner}).then(function () {
                console.log("Crowdsale started.");
            });
        });
    });

});