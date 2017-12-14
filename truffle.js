module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 18545,
      network_id: "*" // Match any network id
    },
    live:{
       host:"localhost",
       post:8545,
       network_id:1,
       from: "0xb6c8f16cc72565e05457950c1De4be946E38Da98"
    },
    kovan: {
          host: "localhost",
          port: 8545,
          network_id: "42",
          from: "0x00E417f2aD0018A84d1cFe4432657418e10C0d94",
          gas: 4600000
      }

  }
};
