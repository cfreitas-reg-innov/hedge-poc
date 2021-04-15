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

function numberToBN(number){
    return new toBN(number).toString();
}

contract('LiquidityPoolDAI', ([owner, holder1, holder2, liquidityProvider1, liquidityProvider2]) => {
    let daiToken, liquidityPoolDAI;

    before(async () => {
        daiToken = await DaiToken.new({from: owner})
        liquidityPoolDAI = await LiquidityPoolDAI.new(daiToken.address, {from: owner})

        // transfer initial quantity of DAI to the Holders
        await daiToken.transfer(holder1, numberToBN(100000))
        await daiToken.transfer(holder2, numberToBN(100000))

        // transfer initial quantity of DAI to the Liquidity Providers
        await daiToken.transfer(liquidityProvider1, numberToBN(100000))
        await daiToken.transfer(liquidityProvider2, numberToBN(100000))
    })

    describe('Provide to the pool', async () => {

        it('Should have liquidity in the pool', async () => {
            // Provides liquidity with LP1
            await daiToken.approve(liquidityPoolDAI.address, numberToBN(70000), {from: liquidityProvider1})
            await liquidityPoolDAI.provide(numberToBN(70000), {from: liquidityProvider1});
            
            // Provides liquidity with LP2
            await daiToken.approve(liquidityPoolDAI.address, numberToBN(30000), {from: liquidityProvider2})
            await liquidityPoolDAI.provide(numberToBN(30000), {from: liquidityProvider2})

            // The total of minted tokens for the LP1
            let mintedLP1 = await liquidityPoolDAI.balanceOf(liquidityProvider1)
            assert.equal(mintedLP1.toString(), numberToBN(70000000))

            // The total of minted tokens for the LP2
            let mintedLP2 = await liquidityPoolDAI.balanceOf(liquidityProvider2)
            assert.equal(mintedLP2.toString(), numberToBN(30000000))

            // The total balance of the pool is the sum of both liquidity providers
            let balance = await liquidityPoolDAI.totalBalance()
            assert.equal(balance.toString(), numberToBN(100000))

            // The supply in the pool is equal to the balance * 1000
            let supply = await liquidityPoolDAI.totalSupply();
            assert.equal(supply.toString(), numberToBN(100000000))
        })

        it('Should give the LPs a share in DAI based on their contribution', async () => {
            // LP1 has 70000 in DAI as share in the pool
            let shareLP1 = await liquidityPoolDAI.shareOf(liquidityProvider1);
            assert.equal(shareLP1.toString(), numberToBN(70000))

            // LP2 has 30000 in DAI as share in the pool
            let shareLP2 = await liquidityPoolDAI.shareOf(liquidityProvider2);
            assert.equal(shareLP2.toString(), numberToBN(30000))
        })
    })

    describe('Withdraw from the pool', async () => {

        it('Should withdraw an amount to the LP1', async () => {
            await liquidityPoolDAI.withdraw(numberToBN(20000), {from: liquidityProvider1});
        })

        it('Should have less balance and supply in the pool', async () => {
            // The total balance of the pool is 20000 less than before
            let balance = await liquidityPoolDAI.totalBalance()
            assert.equal(balance.toString(), numberToBN(80000))

            // The supply in the pool is equal to the balance * 1000
            let supply = await liquidityPoolDAI.totalSupply();
            assert.equal(supply.toString(), numberToBN(80000000))

        })

        it('Should decrease the total share in the pool for the LP1', async () => {
            // LP1 has 20000 less in DAI as share in the pool
            let shareLP1 = await liquidityPoolDAI.shareOf(liquidityProvider1);
            assert.equal(shareLP1.toString(), numberToBN(50000));
        })

        it('Should increase the amount of DAI that LP1 has in his wallet', async () => {
            // LP1 had 30000 left after providing to the pool, now he has 30000 + 20000 returned from his withdrawal
            let totalDAILP1 = await daiToken.balanceOf(liquidityProvider1);
            assert.equal(totalDAILP1.toString(), numberToBN(50000));
        })

    })

})