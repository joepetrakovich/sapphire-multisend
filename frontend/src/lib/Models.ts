
export interface Token {
    name: string,
    symbol: string,
    decimals: number,
    address: string,
    balance: bigint
}

export interface Currency {
    name: string,
    symbol: string,
    decimals: number
};

export interface Network {
    name: string,
    chainIdHex: string,
    chainIdDecimal: number,
    rpcUrls: string[],
    blockExplorerUrls: string[],
    nativeCurrency: Currency
}

export enum NetworkStatus { 
    INITIALIZING,
    WALLET_NOT_CONNECTED,
    PROVIDER_NOT_FOUND, 
    ON_DIFFERENT_NETWORK, 
    ON_DESIRED_NETWORK
};
