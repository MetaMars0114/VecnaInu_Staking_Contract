const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Test Staking Smart Contract', function () {
  let TokenFactory, StakingFactory
  let token, staking
  let user, pool
  before(async () => {
    [user, pool] = await ethers.getSigners()
    TokenFactory = await ethers.getContractFactory('TestToken')
    StakingFactory = await ethers.getContractFactory('Staking')
  })

  beforeEach(async () => {
    token = await TokenFactory.deploy("TEST", "TST")
    await token.deployed()
    staking = await StakingFactory.deploy(token.address, pool.address)
    await staking.deployed()
    token.connect(pool).mint('10000000000000000')
    token.connect(pool).approve(staking.address, '10000000000000000')
  })

  it("Stake, Harvest and Unstake Token", async () => {
    expect((await token.balanceOf(user.address)).toString()).to.equal('0')
    await (await token.connect(user).mint('10000')).wait()
    expect((await token.balanceOf(user.address)).toString()).to.equal('10000')
    await (await token.connect(user).approve(staking.address, '10000'))
    await (await staking.connect(user).stake('10000')).wait()
    expect((await token.balanceOf(user.address)).toString()).to.equal('0')
    let infos = await staking.getStakingInfo(user.address)
    expect((await staking.claimableAt(user.address, infos[1][0])).toString()).to.equal('0')
    expect((await staking.claimable(user.address)).toString()).to.equal('0')
    await expect(staking.unstake(infos[1][0], '1')).to.be.revertedWith('Lock Period')
    const oneyear = 365 * 24 * 60 * 60
    await ethers.provider.send('evm_increaseTime', [oneyear])
    await ethers.provider.send('evm_mine')
    expect((await staking.claimable(user.address)).toString()).to.equal('30000')
    await (await staking.connect(user).harvest()).wait()
    expect((await staking.claimable(user.address)).toString()).to.equal('0')
    expect((await token.balanceOf(user.address)).toString()).to.equal('30000')
    await (await staking.connect(user).unstake(infos[1][0], '10000'))
    infos = await staking.getStakingInfo(user.address)
    expect(infos[0].length).to.equal(0)
    expect((await token.balanceOf(user.address))).to.equal('40000')
  })

  it("Stake and Unstake Token", async () => {
    expect((await token.balanceOf(user.address)).toString()).to.equal('0')
    await (await token.connect(user).mint('10000')).wait()
    expect((await token.balanceOf(user.address)).toString()).to.equal('10000')
    await (await token.connect(user).approve(staking.address, '10000'))
    await (await staking.connect(user).stake('10000')).wait()
    expect((await token.balanceOf(user.address)).toString()).to.equal('0')
    let infos = await staking.getStakingInfo(user.address)
    expect((await staking.claimableAt(user.address, infos[1][0])).toString()).to.equal('0')
    expect((await staking.claimable(user.address)).toString()).to.equal('0')
    await expect(staking.unstake(infos[1][0], '1')).to.be.revertedWith('Lock Period')
    const oneyear = 365 * 24 * 60 * 60
    await ethers.provider.send('evm_increaseTime', [oneyear])
    await ethers.provider.send('evm_mine')
    expect((await staking.claimable(user.address)).toString()).to.equal('30000')
    await (await staking.connect(user).unstake(infos[1][0], '10000'))
    infos = await staking.getStakingInfo(user.address)
    expect(infos[0].length).to.equal(0)
    expect((await token.balanceOf(user.address)).toString()).to.equal('40000')
  })
});
