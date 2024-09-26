import { http, Address } from "viem";
import { PIL_TYPE } from "@story-protocol/core-sdk";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { loadPrivatekeys } from "./transfer";
import { privateKeyToAccount } from "viem/accounts";
import * as fs from 'fs';
import * as path from 'path';

const rpcProviderUrl = 'https://testnet.storyrpc.io';
const keyCollectionAddress: { [key: string]: any } = {};

const sourceFilePath = './sdk_load_test/wallets_privateKeys.json'; 
const destinationFilePath = './sdk_load_test/wallets_privateKey_test.json';
const numberOfEntriesToCopy = 100;
const numberOfExecutions = 20;

async function createCollection(privateKey: string) {
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

    return { privateKey, nftCollectionAddress }
}

async function createIpAssetWithExistingCollection(privateKey: string) {
    const testAccount = privateKeyToAccount(privateKey as Address);
    const config: StoryConfig = {
        account: testAccount,
        transport: http(rpcProviderUrl),
    };

    const testClient = StoryClient.newClient(config);
    const nftCollectionAddress = keyCollectionAddress[privateKey];
    console.log(`NFT Collection address: ${nftCollectionAddress}`);


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

function replacer(key: string, value: any) {
    if (typeof value === 'bigint') {
        return value.toString(); // Convert BigInt to string
    }
    return value; // Return the value as is for other types
}

// Function to copy the first N addresses and private keys to a new file
function copyFirstNAddressesAndKeys(sourceFilePath: string, destinationFilePath: string, count: number) {
    // Read the source JSON file
    const data = fs.readFileSync(sourceFilePath, 'utf-8');
    const jsonData = JSON.parse(data);

    // Extract the first N addresses and private keys
    const addressesToCopy = jsonData.addresses.slice(0, count);
    const privateKeysToCopy = jsonData.privateKeys.slice(0, count);

    // Create a new JSON structure
    const newJsonData = {
        addresses: addressesToCopy,
        privateKeys: privateKeysToCopy
    };

    // Write the new JSON structure to the destination file
    fs.writeFileSync(destinationFilePath, JSON.stringify(newJsonData, null, 4)); // Pretty print with 4 spaces
    console.log(`Copied the first ${count} addresses and private keys to ${destinationFilePath}`);
};

async function executeCreateCollections() {
    const privateKeys : string[] = loadPrivatekeys('./sdk_load_test/wallets_privateKey_test.json');
    console.log(`Wallets loaded: ${privateKeys}`);

    // Create an array of promises for createCollection
    const promises = privateKeys.map(privateKey => createCollection(privateKey));

    // Using Promise.all to wait for all promises to resolve
    try {
        const results = await Promise.all(promises);
        
        results.forEach(result => {
            keyCollectionAddress[result.privateKey] = result.nftCollectionAddress;
        });

        console.log('Key-Value Data:', keyCollectionAddress);
    } catch (error) {
        console.error('Error creating NFT collections:', error);
    }
}

async function executePromises() {
    const privateKeys : string[] = loadPrivatekeys('./sdk_load_test/wallets_privateKey_test.json');
    console.log(`Wallets loaded: ${privateKeys}`);
    const promises: Promise<any>[] = privateKeys.map(async (privateKey) => {
        const startTime = Date.now(); // Record the start time
        const result = await createIpAssetWithExistingCollection(privateKey); // Execute the promise
        const endTime = Date.now(); // Record the end time
        const duration = endTime - startTime; // Calculate the duration
        console.log(`Request for privateKey ${privateKey} took ${duration} ms`); // Print the duration
        return { result, duration }; // Return the result
    });

    // Using Promise.all to wait for all promises to resolve
    try {
        const results = await Promise.all(promises);
        console.log('All promises have resolved');

        // Extract the durations from the results
        const durations = results.map(result => result.duration);

        // Calculate the number of requests that took longer than 8000 ms (6 seconds)
        const longRequests = durations.filter(duration => duration > 8000);
        const longRequestCount = longRequests.length;
        const totalRequests = durations.length;
        const longRequestPercentage = (longRequestCount / totalRequests) * 100;

        console.log(`Number of requests taking longer than 6 seconds: ${longRequestCount}`);
        console.log(`Percentage of requests taking longer than 6 seconds: ${longRequestPercentage.toFixed(2)}%`);

        results.forEach((result, index) => {
            console.log(`Result of promise ${index + 1}:`, result);
            const outputFilePath = `./sdk_load_test/test_results/load_results_${index + 1}.json`;
            fs.writeFileSync(outputFilePath, JSON.stringify(results, replacer, 4)); 
        });
    } catch (error) {
        console.error('At least one promise was rejected:', error);
    }
}

// Function to read and merge JSON files from a directory
async function mergeJsonFiles(directory: string) {
    const mergedResults: any[] = []; // Array to hold merged results

    // Read all files in the specified directory
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);
        if (fs.statSync(filePath).isFile() && filePath.endsWith('.json')) {
            // Read and parse each JSON file
            const data = fs.readFileSync(filePath, 'utf-8');
            const jsonData = JSON.parse(data);
            mergedResults.push(...jsonData); // Merge results
        }
    }

    return mergedResults;
};

// Function to analyze durations
function analyzeDurations(results: any[]) {
    const durations = results.map(result => result.duration);
    const totalDuration = durations.reduce((acc, curr) => acc + curr, 0);
    const averageDuration = totalDuration / durations.length;

    // Count durations in specific ranges
    const longDurationCount = durations.filter(duration => duration > 8000).length;
    const shortDurationCount = durations.filter(duration => duration <= 8000).length;

    // Total number of requests
    const totalRequests = results.length;

    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Total Duration: ${totalDuration} ms`);
    console.log(`Average Duration: ${averageDuration.toFixed(2)} ms`);
    console.log(`Count of durations > 8000 ms: ${longDurationCount}`);
    console.log(`Count of durations <= 8000 ms: ${shortDurationCount}`);
};

// Main function to execute the merging and analysis
async function testResult() {
    const directoryPath = './sdk_load_test/test_results'; // Replace with your directory containing JSON files
    const mergedResults = await mergeJsonFiles(directoryPath);
    analyzeDurations(mergedResults);
}

async function main() {
    copyFirstNAddressesAndKeys(sourceFilePath, destinationFilePath, numberOfEntriesToCopy);
    await executeCreateCollections();

    for (let i = 0; i < numberOfExecutions; i++) {
        console.log(`Execution ${i + 1}:`);
        await executePromises(); // Ensure this is in an async context
    }

    testResult();
}

// Call the main function
main().catch(error => {
    console.error('Error in main execution:', error);
});
