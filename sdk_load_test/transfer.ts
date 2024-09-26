import { ethers } from "ethers";
import * as fs from 'fs';

const gethEndpoint = 'https://testnet.storyrpc.io';
const walltePrivateKey = '45813784c38bb79693e587efc8b754ca12e04552358855cc02f069da9c11b79c'
const provider = new ethers.JsonRpcProvider(gethEndpoint);
const wallet = new ethers.Wallet(walltePrivateKey, provider);
const filePath = './test/load_test/wallets.json';

export async function transferTokens(sender: ethers.HDNodeWallet | ethers.Wallet = wallet, to: string, value: string = '0.01') {
    try {
        // print time formatted before send transaction
        const startTime = new Date().toISOString();
        console.log('Transaction start time:', startTime);
        const sendFrom = new ethers.Wallet(sender.privateKey, provider)
        const tx = await sendFrom.sendTransaction({
            to: to,
            value: ethers.toBeHex(ethers.parseEther(value)),
        });
        const txReceipt = await tx.wait(1, 100000);
        // print time formatted after send transaction
        const endTime = new Date().toISOString();
        console.log('Transaction confirm time:', endTime);
        // measure the time taken to send transaction
        const timeDiff = new Date(endTime).getTime() - new Date(startTime).getTime();
        console.log('Time taken to send transaction:', timeDiff, 'ms');
        if ((globalThis as any).timeTaken !== undefined) {
            (globalThis as any).timeTaken.tokenTransfer.tokenTransfer = timeDiff;
        }
        return txReceipt;
    }
    catch (error) {
        throw new Error(`${gethEndpoint}:` + error);
    }
}

// Load wallet addresses from the JSON file
export const loadWallets = (filePath: string) => {
    const data = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(data);
    return json.addresses;
};
// Load wallet addresses from the JSON file
export const loadPrivatekeys = (filePath: string) => {
    const data = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(data);
    return json.privateKeys;
};

async function main() {
    const wallets = loadWallets('./test/load_test/wallets_privateKeys.json');
    console.log(`Wallets loaded: ${wallets}`);

    for (const walletAddress of wallets) {
        try {
            console.log(`Sending transaction to: ${walletAddress}`);
            const txReceipt = await transferTokens(wallet, walletAddress, '100');
        } catch (error) {
            console.error(`Failed to send transaction to ${walletAddress}:`, error);
        }
    }
}

// Execute the main function
// main().catch(console.error);
