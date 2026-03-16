export interface IUser {
    _id: string;
    name: string;
    email: string;
    image?: string;
    role: "user" | "admin";
    createdAt: Date;
}

export interface IStock {
    _id: string;
    symbol: string;
    name: string;
    exchange: string;
    industry: string;
    logo: string;
    isActive: boolean;
    createdAt: Date;
}

export interface IWatchlistItem {
    _id: string;
    userId: string;
    stockSymbol: string;
    stockName: string;
    addedAt: Date;
}

export interface IAlert {
    _id: string;
    userId: string;
    stockSymbol: string;
    stockName: string;
    condition: "above" | "below";
    targetPrice: number;
    isActive: boolean;
    isTriggered: boolean;
    createdAt: Date;
}

export interface IStockQuote {
    c: number;   // current price
    d: number;   // change
    dp: number;  // percent change
    h: number;   // high
    l: number;   // low
    o: number;   // open
    pc: number;  // previous close
    t: number;   // timestamp
}

export interface IStockProfile {
    name: string;
    ticker: string;
    exchange: string;
    ipo: string;
    marketCapitalization: number;
    shareOutstanding: number;
    logo: string;
    phone: string;
    weburl: string;
    finnhubIndustry: string;
    country: string;
    currency: string;
}

export interface IStockCandle {
    c: number[];  // close prices
    h: number[];  // high prices
    l: number[];  // low prices
    o: number[];  // open prices
    t: number[];  // timestamps
    v: number[];  // volumes
    s: string;    // status
}

export interface INews {
    id: number;
    headline: string;
    summary: string;
    source: string;
    url: string;
    datetime: number;
    image: string;
    category: string;
}

export interface IActionResponse<T = null> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface SearchParams {
    [key: string]: string | string[] | undefined;
}