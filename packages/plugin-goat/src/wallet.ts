import { type Chain, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { WalletClientBase } from "@goat-sdk/core";
import { viem } from "@goat-sdk/wallet-viem";

// Define Mode Sepolia chain
export const modeSepolia: Chain = {
    id: 919,
    name: "Mode Sepolia",
    nativeCurrency: {
        decimals: 18,
        name: "ETH",
        symbol: "ETH",
    },
    rpcUrls: {
        default: {
            http: ["https://sepolia.mode.network"],
        },
        public: {
            http: ["https://sepolia.mode.network"],
        },
    },
} as const;

export function getWalletClient(
    getSetting: (key: string) => string | undefined
) {
    const privateKey = getSetting("EVM_PRIVATE_KEY");
    if (!privateKey) return null;

    const provider = getSetting("EVM_PROVIDER_URL");
    if (!provider) throw new Error("EVM_PROVIDER_URL not configured");

    // Ensure private key is properly formatted
    const formattedKey = privateKey.startsWith("0x")
        ? privateKey
        : `0x${privateKey}`;
    const account = privateKeyToAccount(formattedKey as `0x${string}`);

    const wallet = createWalletClient({
        account,
        chain: modeSepolia,
        transport: http(provider),
    });

    return viem(wallet);
}

export function getWalletProvider(walletClient: WalletClientBase) {
    return {
        async get(): Promise<string | null> {
            try {
                const address = walletClient.getAddress();
                const balance = await walletClient.balanceOf(address);
                return `EVM Wallet Address: ${address}\nBalance: ${balance.value.toString()} ${modeSepolia.nativeCurrency.symbol}`;
            } catch (error) {
                console.error("Error in EVM wallet provider:", error);
                return null;
            }
        },
    };
}
