const { assert } = require('chai')
const BN = web3.utils.BN;

const DaiToken = artifacts.require('DaiToken')
const Put = artifacts.require('Put')
const LiquidityPool = artifacts.require('LiquidityPool')
const FakeSwap = artifacts.require('FakeSwap')
const FakePriceProvider = artifacts.require('FakePriceProvider')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Put', ([holder1, holder2, liquidityProvider1, liquidityProvider2]) => {
    let daiToken, put, liquidityPool, fakePriceProvider, fakeSwap;

    before(async () => {
        daiToken = await DaiToken.new()
        liquidityPool = await LiquidityPool.new(daiToken.address, {from: holder1})
        fakePriceProvider = await FakePriceProvider.new(new BN(2000))
        fakeSwap = await FakeSwap.new(fakePriceProvider.address, daiToken.address)
        put = await Put.new(daiToken.address, fakePriceProvider.address, fakeSwap.address, {from: holder1})

        // transfer initial quantity of DAI to the Holders
        await daiToken.transfer(holder1, new BN(1000))
        await daiToken.transfer(holder2, new BN(1000))

        // transfer initial quantity of DAI to the Liquidity Providers
        await daiToken.transfer(liquidityProvider1, new BN(1000))
        await daiToken.transfer(liquidityProvider2, new BN(1000))
    })

    describe('Create a Put Option', async () => {

        it('Should have liquidity in the pool', async () => {
            // Provides liquidity with LP1
            await daiToken.approve(liquidityPool.address, new BN(70), {from: liquidityProvider1})
            await liquidityPool.provide(new BN(70), {from: liquidityProvider1})

            // Provides liquidity with LP2
            await daiToken.approve(liquidityPool.address, new BN(30), {from: liquidityProvider2})
            await liquidityPool.provide(new BN(30), {from: liquidityProvider2})

            // The total balance of the pool is the sum of both liquidity providers
            let balance = await liquidityPool.totalBalance()
            assert.equal(balance.toString(), new BN(100))

        })
        
        it('Put contract has holder1 as owner', async () => {
            let owner = await put.owner()
            assert.equal(owner.toString(), '0xA17BAFF8c84fcacD7CA0fE1d19cC43e08D5321AA')

            owner = await liquidityPool.owner()
            assert.equal(owner.toString(), '0xA17BAFF8c84fcacD7CA0fE1d19cC43e08D5321AA')
        })

        it('Should send 1 ETH as Premium to the Put contract', async () => {
            await put.sendPremium(new BN(1), {from: holder1})

            let balance = daiToken.balanceOf(holder1)
            assert.equal(balance.toString(), '70');

        })

        
    })
})