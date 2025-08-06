import { BinanceClient } from '@/lib/binance';
import { createSuccessResponse, createErrorResponse, createInternalErrorResponse } from '@/lib/response';
import { ERROR_CODES } from '@/lib/constants';
import type { OrderRequest, OrderResponse, FuturesOrderRequest, MarketType } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const marketType = (searchParams.get('market') as MarketType) || 'spot';
    
    if (!['spot', 'futures'].includes(marketType)) {
      return createErrorResponse(ERROR_CODES.INVALID_MARKET_TYPE);
    }
    
    const body: OrderRequest | FuturesOrderRequest = await request.json();
    
    const { symbol, side, type, quantity, price, timeInForce } = body;
    
    if (!symbol || !side || !type || !quantity) {
      return createErrorResponse(ERROR_CODES.MISSING_REQUIRED_PARAMS, 'Missing required parameters: symbol, side, type, quantity');
    }
    
    if (type === 'LIMIT' && !price) {
      return createErrorResponse(ERROR_CODES.PRICE_REQUIRED_FOR_LIMIT);
    }
    
    if (!['BUY', 'SELL'].includes(side)) {
      return createErrorResponse(ERROR_CODES.INVALID_SIDE);
    }
    
    if (!['LIMIT', 'MARKET'].includes(type)) {
      return createErrorResponse(ERROR_CODES.INVALID_ORDER_TYPE);
    }
    
    const client = new BinanceClient();
    let orderResponse: OrderResponse;
    
    if (marketType === 'futures') {
      const futuresBody = body as FuturesOrderRequest;
      orderResponse = await client.createFuturesOrder({
        symbol,
        side,
        type,
        quantity,
        price,
        timeInForce,
        positionSide: futuresBody.positionSide,
        reduceOnly: futuresBody.reduceOnly,
      });
    } else {
      orderResponse = await client.createSpotOrder({
        symbol,
        side,
        type,
        quantity,
        price,
        timeInForce,
      });
    }
    
    return createSuccessResponse(orderResponse, marketType);
  } catch (error) {
    console.error('Order API Error:', error);
    return createInternalErrorResponse(error);
  }
}