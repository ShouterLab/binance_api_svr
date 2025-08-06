import { NextResponse } from 'next/server';
import { ERROR_CODES, ERROR_MESSAGES } from './constants';
import type { ApiResponse, ApiResponseWithMarket, MarketType } from './types';

export function createSuccessResponse<T>(
  data: T,
  marketType?: MarketType
): NextResponse<ApiResponse<T> | ApiResponseWithMarket<T>> {
  const response: ApiResponse<T> | ApiResponseWithMarket<T> = {
    errorCode: ERROR_CODES.SUCCESS,
    errorMsg: ERROR_MESSAGES[ERROR_CODES.SUCCESS],
    body: data,
  };

  if (marketType) {
    (response as ApiResponseWithMarket<T>).marketType = marketType;
  }

  return NextResponse.json(response);
}

export function createErrorResponse(
  errorCode: number,
  customMessage?: string,
  httpStatus: number = 400
): NextResponse<ApiResponse> {
  const errorMsg = customMessage || ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] || 'Unknown error';
  
  return NextResponse.json(
    {
      errorCode,
      errorMsg,
    },
    { status: httpStatus }
  );
}

export function createBinanceErrorResponse(
  binanceError: string,
  httpStatus: number = 500
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      errorCode: ERROR_CODES.BINANCE_API_ERROR,
      errorMsg: `${ERROR_MESSAGES[ERROR_CODES.BINANCE_API_ERROR]}: ${binanceError}`,
    },
    { status: httpStatus }
  );
}

export function createInternalErrorResponse(
  error: unknown
): NextResponse<ApiResponse> {
  const errorMsg = error instanceof Error ? error.message : 'Unknown error';
  
  return NextResponse.json(
    {
      errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
      errorMsg: `${ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR]}: ${errorMsg}`,
    },
    { status: 500 }
  );
}