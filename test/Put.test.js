const DaiToken = artifacts.require('DaiToken')
const Put = artifacts.require('Put')

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

contract('Put', ([holder1, holder2]) => {
    let daiToken, put

    before(async () => {
        daiToken = await DaiToken.new()
        put = await Put.new(daiToken.address)

        // transfer initial quantity of DAI to the Holders
        await daiToken.transfer(holder1, tokens('1000'))
        await daiToken.transfer(holder2, tokens('1000'))
    })

    describe('Create a Put Option', async () => {
        
        it('sends premium to the Liquidity Pool ', async () => {
            await put.create(tokens('0'), tokens('5'), tokens('3'))
            totalBalance = await put.pool.totalBalance();
        })
    })
})