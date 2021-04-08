const { assert } = require('chai')
const BN = web3.utils.BN;

const DaiToken = artifacts.require('DaiToken')
const LiquidityPoolETH = artifacts.require('LiquidityPoolETH')

const BN_1000 = new BN(1000).toString();
const BN_100 = new BN(100).toString();
const BN_50 = new BN(50).toString();

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('LiquidityPoolETH', ([owner, holder1, holder2, liquidityProvider1, liquidityProvider2]) => {
    let liquidityPoolETH


    before(async () => {
        liquidityPoolETH = await LiquidityPoolETH.new({from: owner})
    })

    describe('LP provides to the liquidity pool', async () => {
        it('has 100 DAI as balance after the first transference', async () => {
            await liquidityPoolETH.sendPremium(new BN(2), {from: liquidityProvider1})

            let balance = await liquidityPoolETH.balanceOf({from: liquidityProvider1})    
            assert.equal(balance.toString(), BN_100)

        })
    })

})
