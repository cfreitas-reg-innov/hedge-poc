const { assert } = require('chai')
const BN = web3.utils.BN;

const DaiToken = artifacts.require('DaiToken')
const FakeSwap = artifacts.require('FakeSwap')
const FakePriceProvider = artifacts.require('FakePriceProvider')

require('chai')
    .use(require('chai-as-promised'))
    .should()


function etherToWei(value){
    return web3.utils.toWei(value, 'ether');
}


contract('FakePriceProvider', ([owner, holder1, holder2, liquidityProvider1, liquidityProvider2]) => {
    let fakePriceProvider;
    let price;

    before(async () => {
        price = new BN(2e3);
        fakePriceProvider = await FakePriceProvider.new(price, {from: owner});
 
    })

    describe('Gets latest answer', async () => {

        it('Latest aswer is what was set in the constructor', async () => {
            let answer = await fakePriceProvider.latestAnswer();
            assert.equal(answer.toString(), price.toString());
        })

    })
})

contract('FakeSwap', ([owner, holder1, holder2, liquidityProvider1, liquidityProvider2]) => {
    let daiToken, fakePriceProvider, fakeSwap;
    let price;

    before(async () => {
        price = new BN(2e3);
        daiToken = await DaiToken.new({from: owner})
        fakePriceProvider = await FakePriceProvider.new(price, {from: owner})
        fakeSwap = await FakeSwap.new(fakePriceProvider.address, daiToken.address, {from: owner})
    })

    describe('Swaps ETH to DAI coins', async () => {

        it('Gets correct amount of tokens by inputprice', async () => {
        
            let tokenInputPrice = await fakeSwap.getEthToTokenInputPrice(etherToWei('0.1'));
            assert.equal(tokenInputPrice.toString(), new BN('200').toString());
        })


    })
})

