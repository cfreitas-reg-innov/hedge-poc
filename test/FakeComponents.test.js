const { assert } = require('chai')
const BN = web3.utils.BN;

const DaiToken = artifacts.require('DaiToken')
const FakeSwap = artifacts.require('FakeSwap')
const FakePriceProvider = artifacts.require('FakePriceProvider')

require('chai')
    .use(require('chai-as-promised'))
    .should()


contract('FakePriceProvider', ([owner, holder1, holder2, liquidityProvider1, liquidityProvider2]) => {
    let fakePriceProvider;

    before(async () => {
        fakePriceProvider = await FakePriceProvider.new(new BN(2000), {from: owner});
    })

    describe('Gets latest answer', async () => {

        it('Latest aswer is what was set in the constructor', async () => {
            let answer = await fakePriceProvider.latestAnswer();
            assert.equal(answer.toString(), new BN('2000').toString());
        })

    })
})

contract('FakeSwap', ([owner, holder1, holder2, liquidityProvider1, liquidityProvider2]) => {
    let daiToken, fakePriceProvider, fakeSwap;

    before(async () => {
        daiToken = await DaiToken.new({from: owner})
        fakePriceProvider = await FakePriceProvider.new(new BN(2000), {from: owner})
        fakeSwap = await FakeSwap.new(fakePriceProvider.address, daiToken.address, {from: owner})
    })

    describe('Swaps ETH to DAI coins', async () => {

        it('Gets correct amount of tokens by inputprice', async () => {
            let tokenInputPrice = await fakeSwap.getEthToTokenInputPrice(new BN(200000000));
            assert.equal(tokenInputPrice.toString(), new BN('3960').toString());
        })


    })
})

