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

contract('Put', ([owner, holder1, holder2, liquidityProvider1, liquidityProvider2]) => {
    let daiToken, put, liquidityPoolDAI, fakePriceProvider, fakeSwap, poolAddress, price;

    before(async () => {
        price = new BN(2e3);
        daiToken = await DaiToken.new({from: owner})
        fakePriceProvider = await FakePriceProvider.new(price, {from: owner})
        fakeSwap = await FakeSwap.new(fakePriceProvider.address, daiToken.address, {from: owner})
        put = await Put.new(daiToken.address, fakePriceProvider.address, fakeSwap.address, {from: owner})

        // references Pool inside Put contract
        poolAddress = await put.pool.call();
        liquidityPoolDAI = await LiquidityPoolDAI.at(poolAddress)

        // transfer initial quantity of DAI to the Holders
        await daiToken.transfer(holder1, numberToBN(100000))
        await daiToken.transfer(holder2, numberToBN(100000))

        // transfer initial quantity of DAI to the Liquidity Providers
        await daiToken.transfer(liquidityProvider1, numberToBN(100000))
        await daiToken.transfer(liquidityProvider2, numberToBN(100000))
    })

    describe('Create a Put Option', async () => {

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

        it('LPs have the share in the pool based on their contribution', async () => {
            // LP1 has 70000 in DAI as share in the pool
            let shareLP1 = await liquidityPoolDAI.shareOf(liquidityProvider1);
            assert.equal(shareLP1.toString(), numberToBN(70000))

            // LP2 has 30000 in DAI as share in the pool
            let shareLP2 = await liquidityPoolDAI.shareOf(liquidityProvider2);
            assert.equal(shareLP2.toString(), numberToBN(30000))
        })

        it('Should create a new contract', async () => {
            let period = new BN(86400);
            let amount = etherToWei('1');
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
        })

        it('Should have no more balance in ETH in the Put contract', async () => {
            // verify that put address no longer has ETH 
            let balance = await web3.eth.getBalance(put.address);
            assert.equal(balance.toString(), new BN('0').toString());

        })

        it('Should have the same amount of balance in the pool as the premium is now locked', async () => {
            // 100000 DAI from LPs (200 DAI from the new contract are still locked)
            let result = await liquidityPoolDAI.totalBalance()
            assert.equal(result.toString(), new BN('100000').toString());
        })

        it('LPs have the', async () => {
            // 100000 DAI from LPs + 200 DAI from the new contract 
            let result = await liquidityPoolDAI.totalBalance()
            assert.equal(result.toString(), new BN('100200').toString());
        })



    })
})
