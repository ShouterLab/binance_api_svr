import { BinanceClient } from '@/lib/binance';
import { createSuccessResponse, createErrorResponse, createInternalErrorResponse } from '@/lib/response';
import { ERROR_CODES } from '@/lib/constants';
import type { BinanceAccount, FuturesAccount, MarketType } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const marketType = (searchParams.get('market') as MarketType) || 'spot';
    
    if (!['spot', 'futures'].includes(marketType)) {
      return createErrorResponse(ERROR_CODES.INVALID_MARKET_TYPE);
    }
    
    const client = new BinanceClient();
    let account: BinanceAccount | FuturesAccount;
    
    if (marketType === 'futures') {
      account = await client.getFuturesAccount();
    } else {
      account = await client.getSpotAccount();
    }
    
    return createSuccessResponse(account, marketType);
  } catch (error) {
    console.error('Account API Error:', error);
    return createInternalErrorResponse(error);
  }
}