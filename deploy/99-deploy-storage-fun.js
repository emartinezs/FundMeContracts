const { getNamedAccounts, deployments, network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (!developmentChains.includes(network.name)) {
        return
    }

    log("----------------------------------------------------")
    log("Deploying FunWithStorage and waiting for confirmations...")
    const funWithStorage = await deploy("FunWithStorage", {
        from: deployer,
        args: [],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1
    })

    log("Logging storage...")
    for (let i = 0; i < 10; i++) {
        log(
            `Location ${i}: ${await ethers.provider.getStorageAt(
                funWithStorage.address,
                i
            )}`
        )
    }

    // You can use this to trace!
    // const trace = await network.provider.send("debug_traceTransaction", [
    //     funWithStorage.transactionHash
    // ])
    // for (structLog in trace.structLogs) {
    //     if (trace.structLogs[structLog].op == "SSTORE") {
    //         console.log(trace.structLogs[structLog])
    //     }
    // }

    // Can you write a function that finds the storage slot of the arrays and mappings?
    // And then find the data in those slots?

    // const arrayElementLocation = ethers.utils.keccak256(
    //     "0x0000000000000000000000000000000000000000000000000000000000000002"
    // )
    // const arrayElement = await ethers.provider.getStorageAt(
    //     funWithStorage.address,
    //     arrayElementLocation
    // )
    // console.log(`Location ${arrayElementLocation}: ${arrayElement}`)

    await printArrayItem(funWithStorage.address, 2)

    await printMappingItem(funWithStorage.address, 3, 0)
    await printMappingItem(funWithStorage.address, 3, 1)
}

async function printArrayItem(contractAddress, storageSlot) {
    const paddedSlot = ethers.utils.hexZeroPad(storageSlot, 32)
    const arrayItemLocation = ethers.utils.keccak256(paddedSlot)
    const arrayItem = await ethers.provider.getStorageAt(
        contractAddress,
        arrayItemLocation
    )
    console.log(`Location ${arrayItemLocation}: ${arrayItem}`)
}

async function printMappingItem(contractAddress, storageSlot, key) {
    const paddedSlot = ethers.utils.hexZeroPad(storageSlot, 32)
    const paddedKey = ethers.utils.hexZeroPad(key, 32)
    const mappingItemLocation = ethers.utils.keccak256(
        paddedKey + paddedSlot.slice(2)
    )
    const mappingItem = await ethers.provider.getStorageAt(
        contractAddress,
        mappingItemLocation
    )
    console.log(`Location ${mappingItemLocation}: ${mappingItem}`)
}

module.exports.tags = ["storage"]
