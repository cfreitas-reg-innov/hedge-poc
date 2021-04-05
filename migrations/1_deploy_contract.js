const Put = artifacts.require("Put");
const DaiToken = artifacts.require("DaiToken");

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

module.exports = async function(deployer, network, accounts) {

    await deployer.deploy(DaiToken)
    const daiToken = await DaiToken.deployed()
    
    await deployer.deploy(Put, '6 months', tokens('1'), tokens('300'), tokens('15'), daiToken.address)
    const put = await Put.deployed()
    
    await daiToken.transfer(accounts[1], tokens('1000')) // Give the investor 1000 DAI
    await daiToken.approve(put.address, tokens('15'), {from: accounts[1]}) // Approve payments by the smart contract for the investor to the liquidity pool
    await put.transferPremium(accounts[0], {from: accounts[1]}) // Transfer the premium from the investor to the liquidity pool
    
};

