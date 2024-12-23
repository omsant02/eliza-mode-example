import { createPublicClient, http } from "viem";
import { mode } from "viem/chains";

export async function calculateCreditScore(address: string) {
    try {
        const publicClient = createPublicClient({
            chain: mode,
            transport: http("https://mainnet.mode.network"),
        });

        // Get basic wallet info
        const [balance, txCount] = await Promise.all([
            publicClient.getBalance({ address: address as `0x${string}` }),
            publicClient.getTransactionCount({
                address: address as `0x${string}`,
            }),
        ]);

        // Convert balance to ETH
        const balanceInEth = Number(balance) / 1e18;

        // Calculate components
        const balanceScore = Math.min(balanceInEth * 40, 40);
        const txScore = Math.min((txCount / 50) * 30, 30);
        const activityScore = Math.min((txCount / 100) * 30, 30);

        // Calculate final score (300-850 range)
        const rawScore = balanceScore + txScore + activityScore;
        const finalScore = Math.floor(300 + (rawScore * 550) / 100);

        return {
            score: finalScore,
            details: {
                balanceETH: balanceInEth.toFixed(4),
                transactionCount: txCount,
                scoreComponents: {
                    balanceScore: Math.round(balanceScore),
                    transactionScore: Math.round(txScore),
                    activityScore: Math.round(activityScore),
                },
            },
        };
    } catch (error) {
        console.error("Error calculating credit score:", error);
        throw new Error("Failed to calculate credit score");
    }
}
