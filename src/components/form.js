import React, {useState} from 'react';
import {Tab, Tabs} from "react-bootstrap";
import { useSnackbar } from 'notistack';
import {Button} from "@material-ui/core";

function Form(props) {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [depositAmount,setAmount]= useState(0);
    const amountHandler = (event) => {
        setAmount( event.target.value);
    }
   const deposit=async (amount) => {
       if (props.dbank !== 'undefined') {
               await props.dbank.methods.deposit().send({value: amount.toString(), from: props.account})
                   .on('transactionHash', function(hash){
                       enqueueSnackbar(`Transaction Pending...`, {variant: 'info',    persist: true,
                       })
                   })
                   .on('receipt', function(receipt){
                       closeSnackbar()
                       enqueueSnackbar(`Approval success`, { variant: 'success',
                           autoHideDuration: 3000,
                           action:  () => <Button onClick={() => window.open(`https://testnet.bscscan.com/tx/${receipt.transactionHash}`, '_blank')
                           }>View</Button>,
                       })
                   })
                   .on('error', function(e, receipt) {
                       switch (e.code)
                       {
                           case(4001):
                               enqueueSnackbar(`Transaction rejected by user`, {variant: 'error',
                                   autoHideDuration: 3000,
                               })
                               break

                           default:
                               console.log('Error, deposit: ', e)
                               break
                       }

                   });
       }
   }
    const withdraw=async (e) => {
        e.preventDefault()
        if (props.dbank !== 'undefined') {

                await props.dbank.methods.withdraw().send({from: props.account})
                    .on('transactionHash', function(hash){
                        enqueueSnackbar(`Transaction Pending...`, {variant: 'info',    persist: true,
                        })
                    })
                    .on('receipt', function(receipt){
                        closeSnackbar()
                        enqueueSnackbar(`Approval success`, { variant: 'success',
                            autoHideDuration: 3000,
                            action:  () => <Button onClick={() => window.open(`https://testnet.bscscan.com/tx/${receipt.transactionHash}`, '_blank')
                            }>View</Button>,
                        })
                    })
                    .on('error', function(e, receipt) {
                        switch (e.code)
                        {
                            case(4001):
                                enqueueSnackbar(`Transaction rejected by user`, {variant: 'error',
                                    autoHideDuration: 3000,
                                })
                                break

                            default:
                                console.log('Error, deposit: ', e)
                                break
                        }

                    });

        }
    }

    return (
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
                                    let amount = depositAmount
                                    amount = amount * 10 ** 18 //convert to wei
                                     deposit(amount)
                                }}>
                                    <div className='form-group mr-sm-2'>
                                        <br></br>
                                        <input
                                            id='depositAmount'
                                            onChange={amountHandler}
                                            step="0.01"
                                            type='number'
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
                                        onClick={(e) => withdraw(e)}>WITHDRAW
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
                            <button className="btn btn-primary btn-light" onClick={(e) => {
                                props.loadBlockchainData(e);
                                window.alert("You may need to manually connect MetaMask to this website");
                            }}>Connect to MetaMask</button> : <div></div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Form;