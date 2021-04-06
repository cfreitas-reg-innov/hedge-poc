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
    })
})