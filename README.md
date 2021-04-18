# Cryptobal
Repository dedicated to Cryptobal's MVP on hedging options in the Ethereum ecosystem.

## Versions
Truffle v5.3.0 (core: 5.3.0)  
Solidity v0.8.3 (solc-js)  
Node v10.19.0  
Web3.js v1.2.9  
Ganache 2.5.4

## Instructions
1. Execute "npm install" inside the project
2. Download Ganache GUI client
3. Start a new project in Ganache and link it to the "truffle-config.js" file inside the project
4. Run and check the results 
```bash
truffle test
truffle test test/Put.test.js
```
5. If you desire to recompile the contracts and deploy them again, you can delete "abis" folder and execute the following commands  
```bash
truffle compile
truffle migrate --reset
```
## Useful commands
```bash
truffle compile # generates ABI files

truffle migrate # deploy contract in the blockchain (using Migration files)
truffle console # interact with the blockchain (open javascript console)
truffle migrate --reset # replace the smartcontract in the blockchain
truffle test # invokes test suite defined under 'test' folder

```
## Git Usage
Project URL:
https://github.com/cfreitas-reg-innov/hedge-poc.git

Configurate a private SSH key:
https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent

#### Proposal

1. Clone the actual repository from the main branch
2. Create a new branch for what you are about to develop
3. Commit your changes locally
4. Push this branch to the repository
5. Propose a Pull Request from the branch to the main branch
6. Evaluate the Pull Request, approving or denying it
7. Merge the new branch with the master branch
8. Delete the new branch remotelly and locally

### Basic commands:

Configuration
```bash
git config --global core.editor "nano" # this is the text editor that I prefer
git config --global user.name "Your Name" # change "Your Name" for your name
git config --global user.email "email@example.com" # change the email for your email
```

Setting up the environment
```bash
git clone https://github.com/cfreitas-reg-innov/hedge-poc.git # downloads this repository to your local file system
git remote add origin git@github.com:cfreitas-reg-innov/hedge-poc.git # add this repository as a remote in your git
git pull origin main # downloads most recent updates
```

Creating a new branch to work on
```bash
git checkout -b new_branch # to create a new branch, utilize the "-b" parameter
git add -A # adds all files to the commit (You can specify the files if this commit is not related to all of them)
git commit -a -m 'message' # it is important to include a message about what was changed in the commit
git push --set-upstream origin new_branch # sets this new branch as a remote branch
```

Creating a Pull Request with the master
```bash
git fetch
git branch -va # Verifies if master branch is behind the new branch
git request-pull master ./ # Creates a PR for this branch
```

Deleting old branch
```bash
git push -d origin <branch_name> # deletes remote branch after Pull Request
git branch -d <branch_name> # deletes local branch after Pull Request
```

Checking branch status
```bash
git status # to check the status of the commits and the branch
```

### Important to notice:
- **.gitignore**: In this file it is set which other files will not be included in the commit, therefore, they will not be included pushed to the repository.
It makes sense not to include system configuration files and data files.




