from ethers import HDNode, entropy_to_mnemonic, random_bytes



# 创建随机助记词
mnemonic = entropy_to_mnemonic(random_bytes(16))

# 创建 HDNode 实例
node = HDNode.from_mnemonic(mnemonic)

# 生成多个钱包地址
for i in range(5):
    path = f"m/44'/60'/0'/0/{i}"
    wallet = node.derive_path(path)
    print(f"Address {i}: {wallet.address}")