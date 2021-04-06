const { assert } = require('chai')

const DaiToken = artifacts.require('DaiToken')
const LiquidityPool = artifacts.require('LiquidityPool')

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

contract('LiquidityPool', ([holder1, holder2, liquidityProvider1, liquidityProvider2]) => {
    let daiToken, liquidityPool

    before(async () => {
        daiToken = await DaiToken.new()
        liquidityPool = await LiquidityPool.new(daiToken.address)

        // transfer initial quantity of DAI to the Holders
        await daiToken.transfer(holder1, tokens('1000'))
        await daiToken.transfer(holder2, tokens('1000'))

        // transfer initial quantity of DAI to the Liquidity Providers
        await daiToken.transfer(liquidityProvider1, tokens('1000'))
        await daiToken.transfer(liquidityProvider2, tokens('1000'))
    })

    describe('LP provides to the liquidity pool', async () => {
        it('has 100 DAI as balance after the first transference', async () => {
            await daiToken.approve(liquidityPool.address, tokens('100'), {from: liquidityProvider1})
            await liquidityPool.provide(tokens('100'), {from: liquidityProvider1})

            let balance = await liquidityPool.totalBalance()    
            assert.equal(balance.toString(), tokens('100'))

        })

        it('LP has correct share of 100 in the pool', async () => {
            let shareOf = await liquidityPool.shareOf(liquidityProvider1)
            assert.equal(shareOf.toString(), tokens('100'))
        })

        it('Total Balance has 150 DAI after the second transference', async () => {
            await daiToken.approve(liquidityPool.address, tokens('50'), {from: liquidityProvider2})
            await liquidityPool.provide(tokens('50'), {from: liquidityProvider2})

            let balance = await liquidityPool.totalBalance()
            assert.equal(balance.toString(), tokens('150'))
        })
    })
    
    describe('LP withdraws from the liquidity pool', async () => {
        it('has 50 DAI as balance and 50 as supply after the withdraw', async () => {
            await liquidityPool.withdraw(tokens('100'), {from: liquidityProvider1})

            let balance = await liquidityPool.totalBalance()
            assert.equal(balance.toString(), tokens('50'))

            let shareOf = await liquidityPool.shareOf(liquidityProvider1)   
            assert.equal(shareOf.toString(), tokens('0'))

        })
    })

})