import {Tabs, Tab} from 'react-bootstrap'
import dBank from '../abis/dBank.json'
import React, {Component} from 'react';
import Token from '../abis/Token.json'
import Web3 from 'web3';
import './App.css';
import bnbLogo from "../assets/bnb.png"

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
        await this.loadBlockchainData(this.props.dispatch)
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

    async deposit(amount) {
        if (this.state.dbank !== 'undefined') {
            try {
                await this.state.dbank.methods().deposit().send({value: amount.toString(), from: this.state.account})
            } catch (e) {
                console.log('Error, deposit: ', e)
            }
        }
    }

    async withdraw(e) {
        e.preventDefault()
        if (this.state.dbank !== 'undefined') {
            try {
                await this.state.dbank.methods.withdraw().send({from: this.state.account})
            } catch (e) {
                console.log('Error, withdraw: ', e)
            }
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
            <div className='text-monospace'>
                <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                </nav>
                <div className="container-fluid mt-5 text-center">
                    <br></br>
                    <h1>Welcome to BNB TRADE <img src={bnbLogo} style={{height: "40px"}} alt="bnb logo"/></h1>
                    <h2>{`Your ID: ${this.state.account}`}</h2>
                    <br></br>
                    <div className="row">
                        <main role="main" className="col-lg-12 d-flex text-center">
                            <div className="content mr-auto ml-auto">
                                <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                                    <Tab eventKey="deposit" title="Deposit">
                                        <div>
                                            <br></br>
                                            How much do you want to deposit?
                                            <br></br>
                                            (min. amount is 0.01 BNB)
                                            <br></br>
                                            (1 deposit is possible at the time)
                                            <br></br>
                                            <form onSubmit={(e) => {
                                                e.preventDefault()
                                                let amount = this.depositAmount.value
                                                amount = amount * 10 ** 18 //convert to wei
                                                this.deposit(amount)
                                            }}>
                                                <div className='form-group mr-sm-2'>
                                                    <br></br>
                                                    <input
                                                        id='depositAmount'
                                                        step="0.01"
                                                        type='number'
                                                        ref={(input) => {
                                                            this.depositAmount = input
                                                        }}
                                                        className="form-control form-control-md"
                                                        placeholder='amount...'
                                                        required/>
                                                </div>
                                                <button type='submit' className='btn btn-primary'>DEPOSIT</button>
                                            </form>

                                        </div>
                                    </Tab>
                                    <Tab eventKey="withdraw" title="Withdraw">
                                        <br></br>
                                        Do you want to withdraw + take interest?
                                        <br></br>
                                        <br></br>
                                        <div>
                                            <button type='submit' className='btn btn-primary'
                                                    onClick={(e) => this.withdraw(e)}>WITHDRAW
                                            </button>
                                        </div>
                                    </Tab>
                                </Tabs>
                            </div>

                        </main>
                        <div className="container">
                            <div className="row">
                                <div className="col text-center">
                                    {typeof window.ethereum === 'undefined' ?
                                        <button className="btn btn-prinary btn-light" onClick={(e) => {
                                            this.loadBlockchainData(e);
                                            window.alert("You may need to manually connect MetaMask to this website");
                                        }}>Connect to MetaMask</button> : <div></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
