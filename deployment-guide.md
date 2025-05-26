# FlowTip Smart Contract Deployment Guide

This guide will walk you through the process of deploying the FlowTip smart contract to the Flow Mainnet and configuring your application to use it.

## Prerequisites

1. A Flow account with FLOW tokens for transaction fees
2. Flow CLI installed (`brew install flow-cli` or follow [Flow CLI installation guide](https://docs.onflow.org/flow-cli/install/))
3. Basic understanding of Cadence, Flow's smart contract language

## Step 1: Set Up Flow CLI Configuration

1. Create a `flow.json` file in the root of your project:

```json
{
  "emulators": {
    "default": {
      "port": 3569,
      "serviceAccount": "emulator-account"
    }
  },
  "contracts": {
    "FlowTip": "./cadence/contracts/FlowTip.cdc"
  },
  "networks": {
    "mainnet": {
      "host": "access.mainnet.nodes.onflow.org:9000",
      "chain": "flow-mainnet"
    }
  },
  "accounts": {
    "emulator-account": {
      "address": "f8d6e0586b0a20c7",
      "key": "YOUR_PRIVATE_KEY"
    },
    "mainnet-account": {
      "address": "YOUR_MAINNET_ADDRESS",
      "key": {
        "type": "hex",
        "index": 0,
        "signatureAlgorithm": "ECDSA_P256",
        "hashAlgorithm": "SHA3_256",
        "privateKey": "YOUR_PRIVATE_KEY"
      }
    }
  },
  "deployments": {
    "mainnet": {
      "mainnet-account": ["FlowTip"]
    }
  }
}