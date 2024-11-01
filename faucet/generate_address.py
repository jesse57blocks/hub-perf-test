import os
from ethers import HDNode, entropy_to_mnemonic, random_bytes

mnemonic = entropy_to_mnemonic(random_bytes(16))

# Use the mnemonic to create an HDNode instance
node = utils.HDNode.from_mnemonic(mnemonic)

# Remove the file if it exists
if os.path.exists('address_id.csv'):
    os.remove('address_id.csv')

# Generate multiple wallets from the HDNode instance
with open('address_id.csv', 'a') as file:
    for i in range(100000):
        path = f"m/44'/60'/0'/0/{i}"
        wallet = node.derive_path(path)
        file.write(f'"{wallet.address}"\n')
