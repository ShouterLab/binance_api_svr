import crypto from 'crypto';
import type { MarketType } from './types';

const BINANCE_SPOT_BASE_URL = 'https://api.binance.com';
const BINANCE_FUTURES_BASE_URL = 'https://fapi.binance.com';

export class BinanceClient {
  private apiKey: string;
  private secretKey: string;

  constructor() {
    this.apiKey = process.env.BINANCE_API_KEY || '';
    this.secretKey = process.env.BINANCE_SECRET_KEY || '';
    
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Binance API credentials are required');
    }
  }

  private getBaseUrl(marketType: MarketType): string {
    return marketType === 'futures' ? BINANCE_FUTURES_BASE_URL : BINANCE_SPOT_BASE_URL;
  }

  private createSignature(queryString: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(queryString)
      .digest('hex');
  }

  private async makeRequest(
    endpoint: string,
    params: Record<string, any> = {},
    method: 'GET' | 'POST' = 'GET',
    signed: boolean = false,
    marketType: MarketType = 'spot'
  ) {
    const timestamp = Date.now();
    
    if (signed) {
      params.timestamp = timestamp;
    }

    const queryString = new URLSearchParams(params).toString();
    let url = `${this.getBaseUrl(marketType)}${endpoint}`;
    
    if (queryString) {
      url += `?${queryString}`;
    }

    const headers: Record<string, string> = {
      'X-MBX-APIKEY': this.apiKey,
      'Content-Type': 'application/json',
    };

    if (signed) {
      const signature = this.createSignature(queryString);
      url += `&signature=${signature}`;
    }

    const response = await fetch(url, {
      method,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Binance API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Spot API methods
  async getSpotAccount() {
    return this.makeRequest('/api/v3/account', {}, 'GET', true, 'spot');
  }

  async getSpotBalances() {
    const account = await this.getSpotAccount();
    return account.balances.filter((balance: any) => 
      parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
    );
  }

  async getSpotTrades(symbol: string, limit: number = 500) {
    return this.makeRequest('/api/v3/myTrades', { symbol, limit }, 'GET', true, 'spot');
  }

  async getSpotTickers() {
    return this.makeRequest('/api/v3/ticker/price', {}, 'GET', false, 'spot');
  }

  async getSpotTicker(symbol: string) {
    return this.makeRequest('/api/v3/ticker/price', { symbol }, 'GET', false, 'spot');
  }

  async createSpotOrder(params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'LIMIT' | 'MARKET';
    quantity: string;
    price?: string;
    timeInForce?: 'GTC' | 'IOC' | 'FOK';
  }) {
    const orderParams: any = { ...params };
    
    if (params.type === 'LIMIT' && !params.price) {
      throw new Error('Price is required for LIMIT orders');
    }
    
    if (params.type === 'LIMIT' && !params.timeInForce) {
      orderParams.timeInForce = 'GTC';
    }

    return this.makeRequest('/api/v3/order', orderParams, 'POST', true, 'spot');
  }

  // Futures API methods
  async getFuturesAccount() {
    return this.makeRequest('/fapi/v2/account', {}, 'GET', true, 'futures');
  }

  async getFuturesBalances() {
    const account = await this.getFuturesAccount();
    return account.assets.filter((asset: any) => 
      parseFloat(asset.walletBalance) > 0
    );
  }

  async getFuturesPositions() {
    const account = await this.getFuturesAccount();
    return account.positions.filter((position: any) => 
      parseFloat(position.positionAmt) !== 0
    );
  }

  async getFuturesTrades(symbol: string, limit: number = 500) {
    return this.makeRequest('/fapi/v1/userTrades', { symbol, limit }, 'GET', true, 'futures');
  }

  async getFuturesTickers() {
    return this.makeRequest('/fapi/v1/ticker/price', {}, 'GET', false, 'futures');
  }

  async getFuturesTicker(symbol: string) {
    return this.makeRequest('/fapi/v1/ticker/price', { symbol }, 'GET', false, 'futures');
  }

  async createFuturesOrder(params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'LIMIT' | 'MARKET';
    quantity: string;
    price?: string;
    timeInForce?: 'GTC' | 'IOC' | 'FOK';
    positionSide?: 'BOTH' | 'LONG' | 'SHORT';
    reduceOnly?: boolean;
  }) {
    const orderParams: any = { ...params };
    
    if (params.type === 'LIMIT' && !params.price) {
      throw new Error('Price is required for LIMIT orders');
    }
    
    if (params.type === 'LIMIT' && !params.timeInForce) {
      orderParams.timeInForce = 'GTC';
    }

    if (!params.positionSide) {
      orderParams.positionSide = 'BOTH';
    }

    return this.makeRequest('/fapi/v1/order', orderParams, 'POST', true, 'futures');
  }

  // Legacy methods for backward compatibility
  async getAccount() {
    return this.getSpotAccount();
  }

  async getBalances() {
    return this.getSpotBalances();
  }

  async getMyTrades(symbol: string, limit: number = 500) {
    return this.getSpotTrades(symbol, limit);
  }

  async getAllSymbolTickers() {
    return this.getSpotTickers();
  }

  async getSymbolTicker(symbol: string) {
    return this.getSpotTicker(symbol);
  }

  async createOrder(params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'LIMIT' | 'MARKET';
    quantity: string;
    price?: string;
    timeInForce?: 'GTC' | 'IOC' | 'FOK';
  }) {
    return this.createSpotOrder(params);
  }
}