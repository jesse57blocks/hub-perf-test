import { mnemonicToSeedSync } from 'bip39';
import { HDNode } from '@ethersproject/hdnode';
import * as fs from 'fs';

function generateWalletAddresses(mnemonic: string, count: number) {
    // Convert mnemonic to seed
    const seed = mnemonicToSeedSync(mnemonic);
    
    // Create HDNode from seed
    const rootNode = HDNode.fromSeed(seed);

    // Generate addresses
    const addresses: string[] = [];
    const privateKeys: string[] = [];
    for (let i = 0; i < count; i++) {
        const childNode = rootNode.derivePath(`m/44'/60'/0'/0/${i}`); // Ethereum derivation path
        const address = childNode.address; // Get the address directly
        const privateKey = childNode.privateKey;
        addresses.push(address);
        privateKeys.push(privateKey);
    }

    return { addresses, privateKeys };
}

const mnemonic = 'short intact february tortoise replace million when toddler venue valley weather sweet';
const numberOfAddresses = 100;

const { addresses: wallets, privateKeys: walletsPrivateKeys } = generateWalletAddresses(mnemonic, numberOfAddresses);

console.log('Generated Wallets:');
wallets.forEach((wallet, index) => {
    console.log(`Wallet ${index + 1}: ${wallet}`);
});

const configData = {
    addresses: wallets,
    privateKeys: walletsPrivateKeys
};
    
const configFilePath = './test/load_test/wallets_privateKeys.json';
fs.writeFileSync(configFilePath, JSON.stringify(configData, null, 4));

console.log(`Generated ${numberOfAddresses} wallets and saved them to ${configFilePath}`);