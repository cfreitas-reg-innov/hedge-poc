const { assert } = require('chai')
const BN = web3.utils.BN;
const toBN = web3.utils.toBN;

const DaiToken = artifacts.require('DaiToken')
const Put = artifacts.require('Put');
const LiquidityPoolDAI = artifacts.require('LiquidityPoolDAI')
const FakeSwap = artifacts.require('FakeSwap')
const FakePriceProvider = artifacts.require('FakePriceProvider')

require('chai')
    .use(require('chai-as-promised'))
    .should()

function etherToWei(value){
    return web3.utils.toWei(value, 'ether');
}

contract('Put', ([owner, holder1, holder2, liquidityProvider1, liquidityProvider2]) => {
    let daiToken, put, liquidityPoolDAI, fakePriceProvider, fakeSwap, poolAddress;

    before(async () => {
        daiToken = await DaiToken.new({from: owner})
        fakePriceProvider = await FakePriceProvider.new(new BN(2000), {from: owner})
        fakeSwap = await FakeSwap.new(fakePriceProvider.address, daiToken.address, {from: owner})
        put = await Put.new(daiToken.address, fakePriceProvider.address, fakeSwap.address, {from: owner})

        // references Pool inside Put contract
        poolAddress = await put.pool.call();
        liquidityPoolDAI = await LiquidityPoolDAI.at(poolAddress)

        // transfer initial quantity of DAI to the Holders
        await daiToken.transfer(holder1, new BN(100000))
        await daiToken.transfer(holder2, new BN(100000))

        // transfer initial quantity of DAI to the Liquidity Providers
        await daiToken.transfer(liquidityProvider1, new BN(100000))
        await daiToken.transfer(liquidityProvider2, new BN(100000))
    })

    describe('Create a Put Option', async () => {

        it('Should have liquidity in the pool', async () => {
            // Provides liquidity with LP1
           
            await daiToken.approve(liquidityPoolDAI.address, new BN(7000), {from: liquidityProvider1})
            await liquidityPoolDAI.provide(new BN(7000), {from: liquidityProvider1});

            
            // Provides liquidity with LP2
            await daiToken.approve(liquidityPoolDAI.address, new BN(3000), {from: liquidityProvider2})
            await liquidityPoolDAI.provide(new BN(3000), {from: liquidityProvider2})

            // The total balance of the pool is the sum of both liquidity providers
            let balance = await liquidityPoolDAI.totalBalance()
            assert.equal(balance.toString(), new BN(10000).toString())

        })

        it('Should create a contract', async () => {
            let period = new BN(86400);
            let amount = new BN(2000);
            let strike = new BN(1500); // The Oracle price is 2000
            let premium = etherToWei('0.1');

            const contract = await put.create(period, amount, strike, {
                from: holder1,
                to: put.address,
                value: premium
            })
            .then((x) => x.logs.find((x) => x.event == "Create"))
            .then((x) => (x ? x.args : null))
            assert.equal(contract.id.toString(), '0')
            //assert.equal(contract.totalFee.toString(), '20000')

            // verify that put address no longer has ETH 
            let balance = await web3.eth.getBalance(put.address);
            assert.equal(balance.toString(), new BN('10').toString());

            // verify that pool has correct balance of DAI (3960 of Swap + 100 provided to the pool)
            let result = await liquidityPoolDAI.totalBalance()
            assert.equal(result.toString(), new BN('4060').toString());
        })

    })
})
