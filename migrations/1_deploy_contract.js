const Put = artifacts.require("Put");
const DaiToken = artifacts.require("DaiToken");
const LiquidityPool = artifacts.require("LiquidityPool");

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

module.exports = async function(deployer, network, accounts) {

    await deployer.deploy(DaiToken)
    const daiToken = await DaiToken.deployed()

    await deployer.deploy(LiquidityPool, daiToken.address)

    await deployer.deploy(Put, daiToken.address)
    const put = await Put.deployed()
};

