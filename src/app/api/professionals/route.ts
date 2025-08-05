import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/professionals - Obtener lista de profesionales con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parámetros de filtrado
    const type = searchParams.get('type') as any;
    const diabetesType = searchParams.get('diabetesType') as any;
    const verified = searchParams.get('verified');
    const minRating = searchParams.get('minRating');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    
    // Paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Construir filtros dinámicos
    const whereClause: any = {};
    
    if (type) whereClause.type = type;
    if (verified !== null) whereClause.verified = verified === 'true';
    if (minRating) whereClause.rating = { gte: parseFloat(minRating) };
    if (maxPrice) whereClause.hourlyRate = { lte: parseFloat(maxPrice) };
    
    // Filtro por especialidad en diabetes
    if (diabetesType) {
      whereClause.specialties = {
        some: {
          diabetesType: diabetesType
        }
      };
    }
    
    // Búsqueda en texto
    if (search) {
      whereClause.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Obtener profesionales con relaciones
    const [professionals, total] = await Promise.all([
      prisma.professional.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          specialties: true,
          _count: {
            select: {
              sessions: true
            }
          }
        },
        orderBy: [
          { verified: 'desc' },
          { rating: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.professional.count({ where: whereClause })
    ]);

    // Calcular estadísticas
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      professionals,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      },
      stats: {
        total,
        verified: professionals.filter(p => p.verified).length,
        averageRating: professionals.reduce((acc, p) => acc + (p.rating || 0), 0) / professionals.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching professionals:', error);
    return NextResponse.json(
      { error: 'Error al obtener profesionales' },
      { status: 500 }
    );
  }
}

// POST /api/professionals - Crear nuevo profesional (requiere autenticación)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      userId,
      type,
      description,
      experience,
      hourlyRate,
      specialties = []
    } = data;

    // Validaciones básicas
    if (!userId || !type) {
      return NextResponse.json(
        { error: 'userId y type son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que no sea ya un profesional
    const existingProfessional = await prisma.professional.findUnique({
      where: { userId }
    });

    if (existingProfessional) {
      return NextResponse.json(
        { error: 'El usuario ya es un profesional' },
        { status: 400 }
      );
    }

    // Crear el profesional con especialidades
    const professional = await prisma.professional.create({
      data: {
        userId,
        type,
        description,
        experience: experience ? parseInt(experience) : null,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        specialties: {
          create: specialties.map((specialty: any) => ({
            diabetesType: specialty.diabetesType,
            description: specialty.description
          }))
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        specialties: true
      }
    });

    // Actualizar el rol del usuario a PROFESSIONAL
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'PROFESSIONAL' }
    });

    console.log('✅ Professional created:', professional.id);

    return NextResponse.json({
      professional,
      message: 'Profesional creado exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating professional:', error);
    return NextResponse.json(
      { error: 'Error al crear profesional' },
      { status: 500 }
    );
  }
}
