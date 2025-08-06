import { BinanceClient } from '@/lib/binance';
import { createSuccessResponse, createErrorResponse, createInternalErrorResponse } from '@/lib/response';
import { ERROR_CODES } from '@/lib/constants';
import type { Balance, FuturesAsset, MarketType } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const marketType = (searchParams.get('market') as MarketType) || 'spot';
    
    if (!['spot', 'futures'].includes(marketType)) {
      return createErrorResponse(ERROR_CODES.INVALID_MARKET_TYPE);
    }
    
    const client = new BinanceClient();
    let balances: Balance[] | FuturesAsset[];
    
    if (marketType === 'futures') {
      balances = await client.getFuturesBalances();
    } else {
      balances = await client.getSpotBalances();
    }
    
    return createSuccessResponse(balances, marketType);
  } catch (error) {
    console.error('Balances API Error:', error);
    return createInternalErrorResponse(error);
  }
}