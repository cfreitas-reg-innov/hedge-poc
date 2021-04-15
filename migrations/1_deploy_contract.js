const Put = artifacts.require("Put");
const DaiToken = artifacts.require("DaiToken");
const FakePriceProvider = artifacts.require('FakePriceProvider');
const FakeSwap = artifacts.require('FakeSwap');
const LiquidityPoolDAI = artifacts.require('LiquidityPoolDAI');
const BN = web3.utils.BN;

module.exports = async function(deployer, network, accounts) {

    await deployer.deploy(DaiToken);
    const daiToken = await DaiToken.deployed();

    await deployer.deploy(LiquidityPoolDAI, daiToken.address);
    const liquidityPoolDAI = await LiquidityPoolDAI.deployed();

    //await deployer.deploy(LiquidityPoolETH);

    await deployer.deploy(FakePriceProvider, new BN(2e3));
    const fakePriceProvider = await FakePriceProvider.deployed();

    await deployer.deploy(FakeSwap, fakePriceProvider.address, daiToken.address);
    const fakeSwap = await FakeSwap.deployed();

    await deployer.deploy(Put, daiToken.address, fakePriceProvider.address, fakeSwap.address);

};

