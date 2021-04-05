const DaiToken = artifacts.require('DaiToken')
const Put = artifacts.require('Put')

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

contract('Put', ([liquidityPool, investor]) => {
    let daiToken, put

    before(async () => {
        daiToken = await DaiToken.new()
        put = await Put.new('6 months', tokens('1'), tokens('300'), tokens('15'), daiToken.address)

        //await daiToken.transfer(put.address, tokens('1000000'));
        await daiToken.transfer(investor, tokens('1000'))
    })

    describe('Mock Dai Deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('Put Deployment', async () => {
        
        it('has a name', async () => {

            const name = await put.name()
            assert.equal(name, 'Put Hedge Option Contract')
        })

        it('investor has tokens', async () => {
            let balance = await daiToken.balanceOf(investor)
            assert.equal(balance.toString(), tokens('1000'))
        })

        it('transfers premium to the liquidity pool', async () => {
            await daiToken.approve(put.address, tokens('15'), {from: investor})
            await put.transferPremium(liquidityPool, {from: investor})
        })

        it('investor has total = tokens - premium', async () => {
            let balance = await daiToken.balanceOf(investor)
            assert.equal(balance.toString(), tokens('985'))
        })

        it('liquidity pool has increased in premium', async () => {
            let balance = await daiToken.balanceOf(liquidityPool)
            assert.equal(balance.toString(), tokens('9999015'))
        })

    })
})