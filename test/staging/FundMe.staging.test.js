const { assert } = require("chai")
const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.contains(network.name)
    ? describe.skip
    : describe("FundMe", async function() {
          let fundMe
          let deployer
          const sendValue = ethers.util.parseEther("1")

          beforeEach(async function() {
              deplyer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getConttract("FundMe", deployer)
          })

          it("Allows people to fund and withdraw", async function() {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw()
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
