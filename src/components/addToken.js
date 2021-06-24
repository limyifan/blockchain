import React from 'react';
import {useSnackbar} from "notistack";
import {Button} from "react-bootstrap";


function AddToken(props) {
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    const FOC_TOKEN_ADDRESS = '0x32C4dF496840841212cBc26a5Ab2f9C8d1EF997c';

    const addTokenToWallet = () => {
        if (window.ethereum) {
            window.ethereum
                .request({
                    method: 'wallet_watchAsset',
                    params: {
                        type: 'ERC20', // Initially only supports ERC20, but eventually more!
                        options: {
                            address: FOC_TOKEN_ADDRESS, // The address that the token is at.
                            symbol: 'DBC', // A ticker symbol or shorthand, up to 5 chars.
                            decimals: 18, // The number of decimals in the token
                            image: 'https://image.flaticon.com/icons/png/512/616/616408.png', // A string url of the token logo
                        },
                    },
                })
                .then(res => {
                    console.log(res)
                    if (res) {
                        enqueueSnackbar("Token added successfully", {
                            variant: 'success',
                            anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'right',
                            },
                        });
                    } else {
                        enqueueSnackbar("Failed to add token", {
                            variant: 'error',
                            anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'right',
                            },
                        });
                    }
                })
                .catch(() => enqueueSnackbar("Failed to add token", {
                    variant: 'error',
                    anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'right',
                    },
                }))
        } else {
        }
    }
    return (
        <div><Button className={"btn btn-primary btn-light"} onClick={addTokenToWallet}>
            Add DBC Token <img src={"https://image.flaticon.com/icons/png/512/616/616408.png"} height={"40"}/>
        </Button></div>

    );
}

export default AddToken;