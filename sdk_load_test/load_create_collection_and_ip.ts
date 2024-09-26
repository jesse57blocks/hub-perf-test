import { http, Address } from "viem";
import { PIL_TYPE } from "@story-protocol/core-sdk";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { loadPrivatekeys } from "./transfer";
import { privateKeyToAccount } from "viem/accounts";

const rpcProviderUrl = 'https://testnet.storyrpc.io';

async function createCollectionAndPublishIpAsset(privateKey: string) {
    const testAccount = privateKeyToAccount(privateKey as Address);
    const config: StoryConfig = {
        account: testAccount,
        transport: http(rpcProviderUrl),
    };

    const testClient = StoryClient.newClient(config);

    const response = await testClient.nftClient.createNFTCollection({
        name: "load-test",
        symbol: "TEST",
        txOptions: {
          waitForTransaction: true,
        },
    });

    const nftCollectionAddress = response.nftContract;
    console.log(`NFT Collection address: ${nftCollectionAddress}`);
    
    // Check if nftCollectionAddress is defined
    if (!nftCollectionAddress) {
        throw new Error("NFT Collection Address is undefined");
    };

    const publicshAssetResponse =await testClient.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        nftContract: nftCollectionAddress,
        pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
        txOptions: {
          waitForTransaction: true,
        },
    });

    console.log(`mintAndRegisterIpAssetWithPilTerms, txHash: ${publicshAssetResponse.txHash}, ipId: ${publicshAssetResponse.ipId}, tokenId: ${publicshAssetResponse.tokenId}, licenseTermsId: ${publicshAssetResponse.licenseTermsId}`);

    if (!publicshAssetResponse.txHash) {
        throw new Error("NFT Collection Address is undefined");
    };

    return { txHash: publicshAssetResponse.txHash,ipId: publicshAssetResponse.ipId, tokenId: publicshAssetResponse.tokenId, licenseTermsId: publicshAssetResponse.licenseTermsId}
};

const privateKeys : string[] = loadPrivatekeys('./test/load_test/wallets_privateKeys.json');
console.log(`Wallets loaded: ${privateKeys}`);

async function executePromises() {
    const promises: Promise<any>[] = privateKeys.map(async (privateKey) => {
        const startTime = Date.now(); // Record the start time
        const result = await createCollectionAndPublishIpAsset(privateKey); // Execute the promise
        const endTime = Date.now(); // Record the end time
        const duration = endTime - startTime; // Calculate the duration
        console.log(`Request for privateKey ${privateKey} took ${duration} ms`); // Print the duration
        return result; // Return the result
    });

    // Using Promise.all to wait for all promises to resolve
    try {
        const results = await Promise.all(promises);
        console.log('All promises have resolved');
        results.forEach((result, index) => {
            console.log(`Result of promise ${index + 1}:`, result);
        });
    } catch (error) {
        console.error('At least one promise was rejected:', error);
    }
}

async function main() {
    const numberOfExecutions = 10; // Change this to the number of times you want to execute
    for (let i = 0; i < numberOfExecutions; i++) {
        console.log(`Execution ${i + 1}:`);
        await executePromises(); // Ensure this is in an async context
    }
}

// Call the main function
main().catch(error => {
    console.error('Error in main execution:', error);
});
