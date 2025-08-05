import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Newsletter API called');
    
    // 1. Parse request body
    const body = await request.json();
    console.log('📝 Body received:', body);
    
    const { email, source } = body;
    
    if (!email || !source) {
      return NextResponse.json({
        error: 'Email and source are required'
      }, { status: 400 });
    }

    console.log('✅ Basic validation passed');

    // 2. Test database connection
    try {
      console.log('🔌 Testing database connection...');
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json({
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown DB error'
      }, { status: 500 });
    }

    // 3. Test database query
    try {
      console.log('📊 Testing database query...');
      const count = await prisma.newsletter.count();
      console.log('✅ Database query successful, current count:', count);
    } catch (queryError) {
      console.error('❌ Database query failed:', queryError);
      return NextResponse.json({
        error: 'Database query failed',
        details: queryError instanceof Error ? queryError.message : 'Unknown query error'
      }, { status: 500 });
    }

    // 4. Try to insert record
    try {
      console.log('💾 Attempting to create newsletter record...');
      
      const newsletter = await prisma.newsletter.create({
        data: {
          email,
          source: 'MAINTENANCE_PAGE', // Use enum value
          spamScore: 0,
          isActive: true,
          isBlocked: false,
          ipAddress: '127.0.0.1', // Simplified for testing
          userAgent: 'Test Agent'
        }
      });

      console.log('✅ Newsletter record created:', newsletter.id);

      return NextResponse.json({
        success: true,
        message: 'Subscription successful',
        id: newsletter.id
      });

    } catch (insertError) {
      console.error('❌ Database insert failed:', insertError);
      return NextResponse.json({
        error: 'Failed to create subscription',
        details: insertError instanceof Error ? insertError.message : 'Unknown insert error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ General error in newsletter API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
