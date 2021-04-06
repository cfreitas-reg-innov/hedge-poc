const { assert } = require('chai')

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
        put = await Put.new(daiToken.address, {from: holder1})

        // transfer initial quantity of DAI to the Holders
        await daiToken.transfer(holder1, tokens('1000'))
        await daiToken.transfer(holder2, tokens('1000'))
    })

    describe('Create a Put Option', async () => {
        
        it('sends premium to the Liquidity Pool ', async () => {
            let owner = await put.owner()
            assert.equal(owner.toString(), '0xA17BAFF8c84fcacD7CA0fE1d19cC43e08D5321AE')
            
            //await put.sendPremium(tokens('15'), {from: holder1});
            //totalBalance = await put.pool.totalBalance();
        })
    })
})