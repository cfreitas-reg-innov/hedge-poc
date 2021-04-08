const { assert } = require('chai')
const BN = web3.utils.BN;

const DaiToken = artifacts.require('DaiToken')
const LiquidityPool = artifacts.require('LiquidityPool')

const BN_1000 = new BN(1000).toString();
const BN_100 = new BN(100).toString();
const BN_50 = new BN(50).toString();

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('LiquidityPoolDAI', ([holder1, holder2, liquidityProvider1, liquidityProvider2]) => {
    let daiToken, liquidityPool

    before(async () => {
        daiToken = await DaiToken.new()
        liquidityPool = await LiquidityPool.new(daiToken.address)

        // transfer initial quantity of DAI to the Holders
        await daiToken.transfer(holder1, BN_1000)
        await daiToken.transfer(holder2, BN_1000)

        // transfer initial quantity of DAI to the Liquidity Providers
        await daiToken.transfer(liquidityProvider1, BN_1000)
        await daiToken.transfer(liquidityProvider2, BN_1000)
    })

    describe('LP provides to the liquidity pool', async () => {
        it('has 100 DAI as balance after the first transference', async () => {
            await daiToken.approve(liquidityPool.address, BN_100, {from: liquidityProvider1})
            await liquidityPool.provide(BN_100, {from: liquidityProvider1})

            let balance = await liquidityPool.totalBalance()    
            assert.equal(balance.toString(), BN_100)

        })

        it('LP has correct share of 100 in the pool', async () => {
            let shareOf = await liquidityPool.shareOf(liquidityProvider1)
            assert.equal(shareOf.toString(), BN_100)
        })

        it('Total Balance has 150 DAI after the second transference', async () => {
            await daiToken.approve(liquidityPool.address, BN_50, {from: liquidityProvider2})
            await liquidityPool.provide(BN_50, {from: liquidityProvider2})

            let balance = await liquidityPool.totalBalance()
            assert.equal(balance.toString(), new BN(150).toString())
        })
    })
    
    describe('LP withdraws from the liquidity pool', async () => {
        it('has 50 DAI as balance and 50 as supply after the withdraw', async () => {
            await liquidityPool.withdraw(BN_100, {from: liquidityProvider1})

            let balance = await liquidityPool.totalBalance()
            assert.equal(balance.toString(), BN_50)

            let supply = await liquidityPool.totalSupply()
            assert.equal(balance.toString(), BN_50)

            let shareOf = await liquidityPool.shareOf(liquidityProvider1)   
            assert.equal(shareOf.toString(), new BN(0).toString())

        })
    })

})