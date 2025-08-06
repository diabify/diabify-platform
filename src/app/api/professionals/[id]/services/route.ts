import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/professionals/[id]/services - Obtener servicios/plantillas que ofrece el profesional
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: professionalId } = params;

    // Verificar que el profesional existe
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    if (!professional) {
      return NextResponse.json(
        { error: 'Profesional no encontrado' },
        { status: 404 }
      );
    }

    // Obtener los servicios/plantillas asignadas al profesional
    const professionalServices = await prisma.professionalSessionTemplate.findMany({
      where: {
        professionalId,
        isEnabled: true
      },
      include: {
        sessionTemplate: {
          include: {
            duration: true,
            specialty: true
          }
        }
      },
      orderBy: {
        sessionTemplate: {
          title: 'asc'
        }
      }
    });

    // Transformar los datos para respuesta
    const services = professionalServices.map((ps: any) => {
      const template = ps.sessionTemplate;
      return {
        id: template.id,
        professionalServiceId: ps.id,
        title: template.title,
        description: template.description,
        category: template.category,
        modality: template.modality,
        basePrice: template.basePrice,
        customPrice: ps.customPrice, // Precio personalizado del profesional
        finalPrice: ps.customPrice || template.basePrice, // Precio que se aplicará
        duration: {
          id: template.duration.id,
          name: template.duration.name,
          minutes: template.duration.minutes
        },
        specialty: template.specialty ? {
          id: template.specialty.id,
          name: template.specialty.name,
          description: template.specialty.description,
          color: template.specialty.color
        } : null,
        requiresPrereq: template.requiresPrereq,
        isActive: template.isActive,
        isEnabled: ps.isEnabled
      };
    });

    // Agrupar por categoría
    const servicesByCategory = services.reduce((acc: any, service: any) => {
      const category = service.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service);
      return acc;
    }, {} as Record<string, typeof services>);

    // Estadísticas
    const stats = {
      totalServices: services.length,
      priceRange: {
        min: Math.min(...services.map((s: any) => s.finalPrice)),
        max: Math.max(...services.map((s: any) => s.finalPrice)),
        average: services.reduce((sum: number, s: any) => sum + s.finalPrice, 0) / services.length
      },
      categories: Object.keys(servicesByCategory).length,
      modalities: [...new Set(services.map((s: any) => s.modality))],
      durations: [...new Set(services.map((s: any) => s.duration.minutes))]
    };

    return NextResponse.json({
      professional: {
        id: professional.id,
        name: professional.user.name,
        avatar: professional.user.avatar,
        type: professional.type,
        verified: professional.verified,
        rating: professional.rating,
        experience: professional.experience
      },
      services,
      servicesByCategory,
      stats
    });

  } catch (error) {
    console.error('❌ Error fetching professional services:', error);
    return NextResponse.json(
      { error: 'Error al obtener servicios del profesional' },
      { status: 500 }
    );
  }
}
