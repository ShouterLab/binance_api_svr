import { BinanceClient } from '@/lib/binance';
import { createSuccessResponse, createInternalErrorResponse } from '@/lib/response';
import type { FuturesPosition } from '@/lib/types';

export async function GET() {
  try {
    const client = new BinanceClient();
    const positions: FuturesPosition[] = await client.getFuturesPositions();
    
    return createSuccessResponse(positions, 'futures');
  } catch (error) {
    console.error('Positions API Error:', error);
    return createInternalErrorResponse(error);
  }
}