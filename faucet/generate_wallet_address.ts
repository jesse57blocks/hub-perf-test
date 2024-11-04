import * as fs from 'fs';
import { ethers } from 'ethers';

function generateWalletAddresses(filePath: string, num: number) {
    const mnemonic = ethers.Mnemonic.fromEntropy(ethers.randomBytes(16));
    console.log('Generated mnemonic:', mnemonic);
    const node = ethers.HDNodeWallet.fromMnemonic(mnemonic);

    // Remove the file if it exists
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    // Generate multiple wallets from the HDNode instance
    const file = fs.createWriteStream(filePath, { flags: 'a' });
    for (let i = 0; i < num; i++) {
        const wallet = node.deriveChild(i);
        console.log(`Wallet ${i + 1}: ${wallet.address}`);
        file.write(`"${wallet.address}"\n`);
    }
    file.end();
}

// Get the number of wallets from command line arguments
const num = process.argv[2] ? parseInt(process.argv[2], 10) : 2; // Default to 2 if not provided
const filePath = './test_data/address_id.csv';

generateWalletAddresses(filePath, num);
