import { BinanceClient } from '@/lib/binance';
import { createSuccessResponse, createErrorResponse, createInternalErrorResponse } from '@/lib/response';
import { ERROR_CODES } from '@/lib/constants';
import type { TickerPrice, MarketType } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const marketType = (searchParams.get('market') as MarketType) || 'spot';
    
    if (!['spot', 'futures'].includes(marketType)) {
      return createErrorResponse(ERROR_CODES.INVALID_MARKET_TYPE);
    }
    
    const client = new BinanceClient();
    
    if (symbol) {
      let ticker: TickerPrice;
      if (marketType === 'futures') {
        ticker = await client.getFuturesTicker(symbol);
      } else {
        ticker = await client.getSpotTicker(symbol);
      }
      return createSuccessResponse(ticker, marketType);
    } else {
      let tickers: TickerPrice[];
      if (marketType === 'futures') {
        tickers = await client.getFuturesTickers();
      } else {
        tickers = await client.getSpotTickers();
      }
      return createSuccessResponse(tickers, marketType);
    }
  } catch (error) {
    console.error('Prices API Error:', error);
    return createInternalErrorResponse(error);
  }
}