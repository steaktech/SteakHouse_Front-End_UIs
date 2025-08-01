// Fee calculation utility for token creation

export interface FeeCalculation {
    tokenCreationFee: number;
    tokenCreationFeeEth: number;
    removeSuffixFee: number;
    removeSuffixFeeEth: number;
    totalCostUsd: number;
    totalCostEth: number;
}

export const calculateFees = (
    tokenType: 'tax' | 'no-tax',
    isAdvancedOpen: boolean,
    removeSuffix: boolean
): FeeCalculation => {
    let tokenCreationFee = 0;
    let tokenCreationFeeEth = 0;
    
    // Determine base token creation fee
    if (isAdvancedOpen) {
        // Advanced token
        tokenCreationFee = 38;
        tokenCreationFeeEth = 0.01;
    } else if (tokenType === 'tax') {
        // Tax token
        tokenCreationFee = 11.40;
        tokenCreationFeeEth = 0.003;
    } else {
        // No-tax token
        tokenCreationFee = 3.80;
        tokenCreationFeeEth = 0.001;
    }
    
    // Remove suffix fee
    const removeSuffixFee = removeSuffix ? 11.40 : 0;
    const removeSuffixFeeEth = removeSuffix ? 0.003 : 0;
    
    // Calculate totals
    const totalCostUsd = tokenCreationFee + removeSuffixFee;
    const totalCostEth = tokenCreationFeeEth + removeSuffixFeeEth;
    
    return {
        tokenCreationFee,
        tokenCreationFeeEth,
        removeSuffixFee,
        removeSuffixFeeEth,
        totalCostUsd,
        totalCostEth,
    };
};