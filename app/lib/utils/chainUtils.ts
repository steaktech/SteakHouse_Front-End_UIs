// Utility function to get chain icon image path based on chain_id
export const getChainIconPath = (chainId?: number): string | null => {
    if (!chainId) return null;

    const chainIconPaths: Record<number, string> = {
        1: '/images/ethereum-logo-blue.png', // Ethereum Mainnet
        11155111: '/images/ethereum-logo-blue.png', // Sepolia Testnet (Ethereum)
        56: '/images/bsc-chain.png', // BSC
        8453: '/images/base-chain.png', // Base
        42161: '/images/arbitrum-chain.png', // Arbitrum
        // Add more chains as needed
    };

    return chainIconPaths[chainId] || null;
};

export const getChainName = (chainId?: number): string => {
    if (!chainId) return 'Unknown';

    const chainNames: Record<number, string> = {
        1: 'Ethereum',
        11155111: 'Sepolia',
        56: 'BSC',
        137: 'Polygon',
        42161: 'Arbitrum',
        10: 'Optimism',
        43114: 'Avalanche',
        250: 'Fantom',
        8453: 'Base',
        42220: 'Celo',
    };

    return chainNames[chainId] || `Chain ${chainId}`;
};

export const getChainShortName = (chainId?: number): string => {
    if (!chainId) return 'Unknown';

    const chainShortNames: Record<number, string> = {
        1: 'ETH',
        11155111: 'SEP',
        56: 'BSC',
        137: 'MATIC',
        42161: 'ARB',
        10: 'OP',
        43114: 'AVAX',
        250: 'FTM',
        8453: 'BASE',
        42220: 'CELO',
    };

    return chainShortNames[chainId] || `${chainId}`;
};
