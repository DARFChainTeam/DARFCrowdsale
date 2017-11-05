module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 18545,
      network_id: "*" // Match any network id
    },
      kovan: {
          host: "localhost",
          port: 8545,
          network_id: "42",
          from: "0x00E417f2aD0018A84d1cFe4432657418e10C0d94"

      }

  }
};
