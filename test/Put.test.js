const { assert } = require('chai')
const BN = web3.utils.BN;

const DaiToken = artifacts.require('DaiToken')
const PutSimple = artifacts.require('PutSimple');
const LiquidityPoolDAI = artifacts.require('LiquidityPoolDAI')
const FakeSwap = artifacts.require('FakeSwap')
const FakePriceProvider = artifacts.require('FakePriceProvider')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('PutSimple', ([owner, holder1, holder2, liquidityProvider1, liquidityProvider2]) => {
    let daiToken, putSimple, liquidityPoolDAI, fakePriceProvider, fakeSwap;

    before(async () => {
        daiToken = await DaiToken.new({from: owner})
        liquidityPoolDAI = await LiquidityPoolDAI.new(daiToken.address, {from: owner})
        fakePriceProvider = await FakePriceProvider.new(new BN(2000).toString(), {from: owner})
        fakeSwap = await FakeSwap.new(fakePriceProvider.address, daiToken.address, {from: owner})
        putSimple = await PutSimple.new(daiToken.address, fakePriceProvider.address, fakeSwap.address, {from: owner})

        // transfer initial quantity of DAI to the Holders
        await daiToken.transfer(holder1, new BN(1000).toString())
        await daiToken.transfer(holder2, new BN(1000).toString())

        // transfer initial quantity of DAI to the Liquidity Providers
        await daiToken.transfer(liquidityProvider1, new BN(1000).toString())
        await daiToken.transfer(liquidityProvider2, new BN(1000).toString())
    })

    describe('Create a Put Option', async () => {

        it('Should have liquidity in the pool', async () => {
            // Provides liquidity with LP1
            await daiToken.approve(liquidityPoolDAI.address, new BN(70).toString(), {from: liquidityProvider1})
            await liquidityPoolDAI.provide(new BN(70).toString(), {from: liquidityProvider1})

            // Provides liquidity with LP2
            await daiToken.approve(liquidityPoolDAI.address, new BN(30).toString(), {from: liquidityProvider2})
            await liquidityPoolDAI.provide(new BN(30).toString(), {from: liquidityProvider2})

            // The total balance of the pool is the sum of both liquidity providers
            let balance = await liquidityPoolDAI.totalBalance()
            assert.equal(balance.toString(), new BN(100).toString())

        })
        
        it('Should send 1 ETH as Premium to the Put contract', async () => {
            await web3.eth.sendTransaction({
                from: holder1,
                to: putSimple.address,
                value: new BN(200000000)
            });

            let balance = await web3.eth.getBalance(putSimple.address);
            assert.equal(balance.toString(), new BN(200000000).toString());

        })

        it('convert 1ETH into DAI', async () => {
            let result, balance;
            let premium = await putSimple.sendPremiumZ(new BN(200000000));
            //assert.equal(premium.toString(), new BN('3960').toString());

            balance = await web3.eth.getBalance(putSimple.address);
            assert.equal(balance.toString(), new BN('0').toString());

            balance = await web3.eth.getBalance(fakeSwap.address);
            assert.equal(balance.toString(), new BN(200000000).toString());
  
            // Put contract receives DAI and sends to the Pool, having '0' DAIs remaining
            result = await daiToken.balanceOf(putSimple.address)
            assert.equal(result.toString(), new BN('0').toString());

            let poolAddress = await putSimple.pool.call();
            result = await daiToken.balanceOf(poolAddress)
            assert.equal(result.toString(), new BN('3960').toString());
        })

        
    })
})