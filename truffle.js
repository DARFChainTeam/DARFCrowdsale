module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 18545,
      network_id: "*" // Match any network id
    },
      rinkeby: {
          host: "localhost",
          port: 8545,
          from: "0xA370dDf42D9C41dfB1A6D7dAF0DB3b7e901a03B2", // default address to use for any transaction Truffle makes during migrations
          network_id: 4,
          gas: 4612388 // Gas limit used for deploys
      }

  }
};
