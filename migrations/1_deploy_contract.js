const PutSimple = artifacts.require("PutSimple");
const Put = artifacts.require("Put");
const DaiToken = artifacts.require("DaiToken");
const FakePriceProvider = artifacts.require('FakePriceProvider');
const FakeSwap = artifacts.require('FakeSwap');
const BN = web3.utils.BN;

module.exports = async function(deployer, network, accounts) {

    await deployer.deploy(DaiToken);
    const daiToken = await DaiToken.deployed();

    //await deployer.deploy(LiquidityPoolDAI, daiToken.address);

    //await deployer.deploy(LiquidityPoolETH);

    await deployer.deploy(FakePriceProvider, new BN(2000));
    const fakePriceProvider = await FakePriceProvider.deployed();

    await deployer.deploy(FakeSwap, fakePriceProvider.address, daiToken.address);
    const fakeSwap = await FakeSwap.deployed();

    await deployer.deploy(PutSimple, daiToken.address, fakePriceProvider.address, fakeSwap.address);

    await deployer.deploy(Put, daiToken.address, fakePriceProvider.address, fakeSwap.address);

};

