const { assert } = require('chai')

const DaiToken = artifacts.require('DaiToken')
const WriteDaiToken = artifacts.require('WriteDaiToken')
const LiquidityPool = artifacts.require('LiquidityPool')

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

contract('LiquidityPool', (accounts) => {
    let daiToken, liquidityPool

    before(async () => {
        daiToken = await DaiToken.new()
        writeDaiToken = await WriteDaiToken.new()
        liquidityPool = await LiquidityPool.new(daiToken.address, writeDaiToken.address)

        // transfer initial quantity of DAI for the investor
        await daiToken.transfer(accounts[7], tokens('1000'))
        await daiToken.transfer(accounts[8], tokens('1000'))
        await daiToken.transfer(accounts[9], tokens('1000'))
    })

    describe('initial balance for the investors', async () => {
        it('each investor has 1000 DAI', async () => {
            let balance1 = await daiToken.balanceOf(accounts[7])
            let balance2 = await daiToken.balanceOf(accounts[8])
            let balance3 = await daiToken.balanceOf(accounts[9])
            assert.equal(balance1.toString(), tokens('1000'))
            assert.equal(balance2.toString(), tokens('1000'))
            assert.equal(balance3.toString(), tokens('1000'))
        })
    })

    describe('investors provide to the liquidity pool', async () => {
        it('has 100 DAI as balance after the first transference', async () => {
            await writeDaiToken.mint(tokens('100'), {from: accounts[7]})
            await daiToken.approve(liquidityPool.address, tokens('100'), {from: accounts[7]})
            await liquidityPool.provide(tokens('100'), {from: accounts[7]})
            let balance = await liquidityPool.totalBalance()    
            assert.equal(balance.toString(), tokens('100'))

        })

        it('has 150 DAI as balance after the second transference', async () => {
            await daiToken.approve(liquidityPool.address, tokens('50'), {from: accounts[8]})
            await liquidityPool.provide(tokens('50'), {from: accounts[8]})
            let balance = await liquidityPool.totalBalance()
            assert.equal(balance.toString(), tokens('150'))
        })
    })


})