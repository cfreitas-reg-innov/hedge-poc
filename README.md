# Definition
Migrations files → Deploy contracts in the blockchain  
abis → Compiled version of the contracts  
contracts → Solidity contract files  
test → Tests written in Mocha Chai for the contract functions  

# Versions
Truffle v5.3.0 (core: 5.3.0)  
Solidity v0.5.16 (solc-js)  
Node v10.19.0  
Web3.js v1.2.9  
Ganache 2.5.4

# Instructions
1. Execute "npm install" inside the project
2. Download Ganache GUI client
3. Start a new project in Ganache and link it to the "truffle-config.js" file inside the project
4. Run and check the results 
```
truffle test
```
5. If you desire to recompile the contracts and deploy them again, you can delete "abis" folder and execute the following commands  
```
truffle compile
truffle migrate --reset
```
# Useful commands
```
truffle compile //generates ABI files

truffle migrate // deploy contract in the blockchain (using Migration files)
truffle console // interact with the blockchain (open javascript console)
	mDai = await DaiToken.deployed() // sets mDai variable with DaiToken for use of its methods
	accounts = await web3.eth.getAccounts() // gets list of accounts
    balance = await mDai.balanceOf(accounts[1]) // sets balance variable with the balance of 2nd account in the list
    balance.toString() // prints its balance
    formattedBalance = web3.utils.fromWei(balance)
    web3.utils.toWei('1.5', 'Ether')
truffle migrate --reset // replace the smartcontract in the blockchain
truffle test // invokes test suite defined under 'test' folder

msg.sender // Who invoked the function
address(this) // the address of this smart contract

```
# Git Usage
Project URL:
https://github.com/cfreitas-reg-innov/hedge-poc.git

Configurate a private SSH key:
https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent

### Basic commands:
```
git clone https://github.com/cfreitas-reg-innov/hedge-poc.git
git remote add origin git@github.com:cfreitas-reg-innov/hedge-poc.git
git pull origin main
git checkout -b new_branch # to create a new branch, utilize the "-b" parameter
git add -A
git commit -a -m 'message' # it is important to include a message about what was changed in the commit
git push --set-upstream origin new_branch

git checkout main # switches back to the main branch

git push -d origin <branch_name> # deletes remote branch after Pull Request
git branch -d <branch_name> # deletes local branch after Pull Request

git status # to check the status of the commits and the branch

git config --global core.editor "nano" # this is the text editor that I prefer
git config --global user.name "Your Name" # change "Your Name" for your name
git config --global user.email "email@example.com" # change the email for your email
```

### Important to notice:
- **.gitignore**: In this file it is set which other files will not be included in the commit, therefore, they will not be included pushed to the repository.
It makes sense not to include system configuration files and data files.

### Proposal
1. Clone the actual repository from the main branch
2. Create a new branch for what you are about to develop
3. Push this branch to the repository
4. Propose a Pull Request from the branch to the main branch


