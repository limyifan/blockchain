import dBank from '../abis/dBank.json'
import React, {Component} from 'react';
import Token from '../abis/Token.json'
import Web3 from 'web3';
import './App.css';
import bnbLogo from "../assets/bnb.png"
import Form from "./form";
import AddToken from"./addToken"
import { SnackbarProvider } from 'notistack';
class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
            web3: 'undefined',
            account: '',
            token: null,
            dbank: null,
            balance: 0,
            dBankAddress: null
        }
    }

    async componentWillMount() {
        await networkSetup()
        await this.loadBlockchainData(this.props.dispatch)
    }
 async componentDidUpdate(prevProps, prevState, snapshot) {
    await this.updateBalance();
 }

    async updateBalance() {
        if(typeof this.state.web3!=="undefined")
        {
            if (typeof this.state.account !== 'undefined') {
                const balance = await this.state.web3.eth.getBalance(this.state.account)

                    this.setState({ balance: balance})
            }
        }

    }

    async loadBlockchainData(dispatch) {
        if (typeof window.ethereum !== 'undefined') {
            const web3 = new Web3(window.ethereum)
           await window.ethereum.enable(); //connect Metamask
            const netId = await web3.eth.net.getId()
            const accounts = await web3.eth.getAccounts()
            //load balance
            if (typeof accounts[0] !== 'undefined') {
                const balance = await web3.eth.getBalance(accounts[0])
                this.setState({account: accounts[0], balance: balance, web3: web3})
            } else {
                window.alert('Please login with MetaMask')
            }

            //load contracts
            try {
                const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address)
                const dbank = new web3.eth.Contract(dBank.abi, dBank.networks[netId].address)
                const dBankAddress = dBank.networks[netId].address
                this.setState({token: token, dbank: dbank, dBankAddress: dBankAddress})
            } catch (e) {
                console.log('Error', e)
                window.alert('Contracts not deployed to the current network')
            }

        } else {
            window.alert('Please install MetaMask')
        }
    }

    async borrow(amount) {
        if (this.state.dbank !== 'undefined') {
            try {
                await this.state.dbank.methods.borrow().send({value: amount.toString(), from: this.state.account})
            } catch (e) {
                console.log('Error, borrow: ', e)
            }
        }
    }

    async payOff(e) {
        e.preventDefault()
        if (this.state.dbank !== 'undefined') {
            try {
                const collateralEther = await this.state.dbank.methods.collateralEther(this.state.account).call({from: this.state.account})
                const tokenBorrowed = collateralEther / 2
                await this.state.token.methods.approve(this.state.dBankAddress, tokenBorrowed.toString()).send({from: this.state.account})
                await this.state.dbank.methods.payOff().send({from: this.state.account})
            } catch (e) {
                console.log('Error, pay off: ', e)
            }
        }
    }

    render() {
        return (
            <SnackbarProvider >
            <div className='text-monospace'>
                <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                </nav>
                <div className="container-fluid mt-5 text-center">
                    <img src={bnbLogo} style={{height: "100px"}} alt="bnb logo"/>
                    <h1>Welcome to BNB TRADE </h1>
                    <h3>{`Your ID: `}<p>{this.state.account}</p></h3>
                    <h3>{`Your Balance: `}<p>{Web3.utils.fromWei(this.state.balance.toString(), 'ether')} BNB</p></h3>
                    <br></br>
<Form dbank={this.state.dbank} account={this.state.account} loadBlockchainData={this.loadBlockchainData} updateBalance={this.updateBalance}/>
                    <AddToken/>

                </div>
            </div>
            </SnackbarProvider>
        );
    }
}
const networkSettings = {
    56: {
        chainId: '0x38',
        chainName: 'BSC Mainnet',
        nativeCurrency: {
            name: 'Binance Coin',
            symbol: 'BNB',
            decimals: 18,
        },
        rpcUrls: ['https://bsc-dataseed.binance.org'],
        blockExplorerUrls: ['https://bscscan.com/'],
    },
    97: {
        chainId: '0x61',
        chainName: 'BSC TestNet',
        nativeCurrency: {
            name: 'Binance Coin',
            symbol: 'BNB',
            decimals: 18,
        },
        rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
        blockExplorerUrls: ['https://testnet.bscscan.com/'],
    },

};
export const networkSetup = () => {
    return new Promise((resolve, reject) => {
        const provider = window.ethereum;
        if (provider) {
                provider
                    .request({
                        method: 'wallet_addEthereumChain',
                        params: [networkSettings[97]],
                    })
                    .then(resolve)
                    .catch(reject);
            }

    });
};

export default App;
