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

const send = (method, params = []) =>
  new Promise((done) =>
    web3.currentProvider.send({id: 0, jsonrpc: "2.0", method, params}, done)
  )

const timeTravel = async (seconds) => {
    await send("evm_increaseTime", [seconds])
    await send("evm_mine")
  }

contract('Put', ([owner, holder1, holder2, liquidityProvider1, liquidityProvider2]) => {
    let daiToken, put, liquidityPoolDAI, fakePriceProvider, fakeSwap, poolAddress, price, optionId;

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
        })

        it('Should give the LPs a share in DAI based on their contribution', async () => {
            // LP1 has 70000 in DAI as share in the pool
            let shareLP1 = await liquidityPoolDAI.shareOf(liquidityProvider1);
            assert.equal(shareLP1.toString(), numberToBN(70000))

            // LP2 has 30000 in DAI as share in the pool
            let shareLP2 = await liquidityPoolDAI.shareOf(liquidityProvider2);
            assert.equal(shareLP2.toString(), numberToBN(30000))
        })

        it('Should create a new contract', async () => {
            let period = numberToBN(86400);
            let amount = etherToWei('1');
            let strike = numberToBN(1500); // The Oracle price is 2000
            let premium = etherToWei('0.1');

            // Create a new contract passing the period, amount, strike and sending the premium in ETH
            const contract = await put.create(period, amount, strike, {
                from: holder1,
                to: put.address,
                value: premium
            })
            .then((x) => x.logs.find((x) => x.event == "Create"))
            .then((x) => (x ? x.args : null))
            optionId = contract.id.toString() 
            assert.equal(optionId, '0')
        })

        it('Should have no more balance in ETH in the Put contract', async () => {
            // verify that put address no longer has ETH 
            let balance = await web3.eth.getBalance(put.address);
            assert.equal(balance.toString(), numberToBN('0').toString());

        })

        it('Should have the same amount of balance in the pool as the premium is now locked', async () => {
            // 100000 DAI from LPs (200 DAI from the new contract are still locked)
            let result = await liquidityPoolDAI.totalBalance()
            assert.equal(result.toString(), numberToBN('100000').toString());
        })
    })

    describe('Unlock Option amount and release the premium after the contract expiration to the LPs', async () => {


        it('Should expire the contract after time passing', async () => {
            // Time travels the EVM to 7 days in the future
            await timeTravel(86400 + 1);
            const actual = await put.unlock(optionId)
            .then((x) => x.logs.filter((x) => x.event == "Expire"))
            .then((x) => x.map((x) => x.args.id.toNumber()))

            // Verifies that the id inside the "Expire" event, for an expired contract
            // corresponds to the contract we requested to unlock
            assert.equal(actual, optionId);
        })

        it('Should increase the share in DAI for the liquidity providers based on their contribution to the pool', async () => {
            // LP1 has 70140 in DAI as share in the pool (70000 provided + 140 (70% of 200) of the premium)
            let shareLP1 = await liquidityPoolDAI.shareOf(liquidityProvider1);
            assert.equal(shareLP1.toString(), numberToBN(70140))

            // LP2 has 30060 in DAI as share in the pool (30000 provided + 60 (30% of 200) of the premium)
            let shareLP2 = await liquidityPoolDAI.shareOf(liquidityProvider2);
            assert.equal(shareLP2.toString(), numberToBN(30060))
        })

        it('Should have the increased amount of balance in the pool as the premium is now unlocked', async () => {
            // 100000 DAI from LPs + 200 DAI from the new contract are unlocked
            let result = await liquidityPoolDAI.totalBalance()
            assert.equal(result.toString(), numberToBN('100200').toString());
        })
    })

    describe('Holder exercise his option and the profit is paid by the liquidity pool', async () => {


        it('Should create a new contract', async () => {
            let period = numberToBN(86400);
            let amount = etherToWei('2');
            let strike = numberToBN(2000); // The Oracle price is 2000
            let premium = etherToWei('0.2');

            // Create a new contract passing the period, amount, strike and sending the premium in ETH
            const contract = await put.create(period, amount, strike, {
                from: holder1,
                to: put.address,
                value: premium
            })
            .then((x) => x.logs.find((x) => x.event == "Create"))
            .then((x) => (x ? x.args : null))
            optionId = contract.id.toString() 
            assert.equal(optionId, '1')
        })
        
        it('Should have the same amount of balance in the pool as the premium is now locked', async () => {
            // 100200 DAI from LPs + 400 DAI from the new contract are locked
            let result = await liquidityPoolDAI.totalBalance()
            assert.equal(result.toString(), numberToBN('100200').toString());
        })

        it('Should exercise the contract by the holder', async () => {
            // Time travels slightly in the future to pretend the market price has changed
            await timeTravel(15 * 60);
            await fakePriceProvider.setPrice(numberToBN(1800));

            const exerciseEvent = await put.exercise('1', {from: holder1})
            .then((x) => x.logs.find((log) => log.event == "Exercise"))
            .then((x) => (x ? x.args : null))
            .catch((x) => assert.fail(x.reason || x))

            assert.isNotNull(exerciseEvent, "'Exercise' event has not been initialized")
            assert.equal(exerciseEvent.id.toNumber(), '1', "Wrong option ID has been initialized")
        })

        it('Should have the balance in DAI for the liquidity pool updated', async () => {
            // LiquidityPool had 100200 before this contract, 400 were added as the premium was paid = 100600
            // When the contract is exercised, 200 is paid in profit, having 100400 left
            let balanceLiquidityPool = await liquidityPoolDAI.totalBalance();
            assert.equal(balanceLiquidityPool.toString(), numberToBN(100400))
        })


        it('Should increase the holder total balance of the holder in 200 DAI', async () => {
            // The difference of the strike - the current price that is paid in profit
            let totalDAIHolder = await daiToken.balanceOf(holder1);
            assert.equal(totalDAIHolder.toString(), numberToBN(100200));
        })




    })
})
