import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar variables de entorno
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      EMAIL_FROM: !!process.env.EMAIL_FROM,
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_PORT: !!process.env.SMTP_PORT,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
    };

    return NextResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: 'production',
      envVariables: envCheck,
      message: 'Debug endpoint working'
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      status: 'OK',
      receivedData: body,
      timestamp: new Date().toISOString(),
      message: 'POST request received successfully'
    });

  } catch (error) {
    console.error('Debug POST error:', error);
    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
