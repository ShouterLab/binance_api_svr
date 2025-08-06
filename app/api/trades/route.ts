import { BinanceClient } from '@/lib/binance';
import { createSuccessResponse, createErrorResponse, createInternalErrorResponse } from '@/lib/response';
import { ERROR_CODES } from '@/lib/constants';
import type { Trade, MarketType } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const limitParam = searchParams.get('limit');
    const marketType = (searchParams.get('market') as MarketType) || 'spot';
    
    if (!symbol) {
      return createErrorResponse(ERROR_CODES.SYMBOL_REQUIRED);
    }
    
    if (!['spot', 'futures'].includes(marketType)) {
      return createErrorResponse(ERROR_CODES.INVALID_MARKET_TYPE);
    }
    
    const limit = limitParam ? parseInt(limitParam) : 500;
    if (limit > 1000) {
      return createErrorResponse(ERROR_CODES.LIMIT_EXCEEDED);
    }
    
    const client = new BinanceClient();
    let trades: Trade[];
    
    if (marketType === 'futures') {
      trades = await client.getFuturesTrades(symbol, limit);
    } else {
      trades = await client.getSpotTrades(symbol, limit);
    }
    
    return createSuccessResponse(trades, marketType);
  } catch (error) {
    console.error('Trades API Error:', error);
    return createInternalErrorResponse(error);
  }
}