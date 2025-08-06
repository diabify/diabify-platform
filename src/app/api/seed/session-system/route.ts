import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/seed/session-system - Poblar sistema de sesiones (sin autenticación para desarrollo)
export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Seeding session system...');

    // Verificar si ya existen datos
    const existingDurations = await prisma.sessionDuration.count();
    if (existingDurations > 0) {
      return NextResponse.json({
        message: 'Sistema de sesiones ya poblado',
        data: { alreadyExists: true }
      });
    }

    // Crear duraciones de sesión por defecto
    const durations = await Promise.all([
      prisma.sessionDuration.create({
        data: { name: '30 minutos', minutes: 30 }
      }),
      prisma.sessionDuration.create({
        data: { name: '45 minutos', minutes: 45 }
      }),
      prisma.sessionDuration.create({
        data: { name: '1 hora', minutes: 60 }
      }),
      prisma.sessionDuration.create({
        data: { name: '1 hora 30 minutos', minutes: 90 }
      }),
      prisma.sessionDuration.create({
        data: { name: '2 horas', minutes: 120 }
      })
    ]);

    // Crear especialidades de sesión por defecto
    const specialties = await Promise.all([
      prisma.sessionSpecialty.create({
        data: {
          name: 'Control Glucémico',
          description: 'Sesiones enfocadas en el manejo y control de los niveles de glucosa',
          color: '#3b82f6'
        }
      }),
      prisma.sessionSpecialty.create({
        data: {
          name: 'Nutrición y Alimentación',
          description: 'Consultas nutricionales y planificación de dietas',
          color: '#10b981'
        }
      }),
      prisma.sessionSpecialty.create({
        data: {
          name: 'Apoyo Psicológico',
          description: 'Soporte emocional y psicológico para el manejo de la diabetes',
          color: '#8b5cf6'
        }
      }),
      prisma.sessionSpecialty.create({
        data: {
          name: 'Educación Diabetológica',
          description: 'Educación sobre el manejo de la diabetes y autocuidado',
          color: '#f59e0b'
        }
      }),
      prisma.sessionSpecialty.create({
        data: {
          name: 'Actividad Física',
          description: 'Planificación de ejercicio adaptado para personas con diabetes',
          color: '#ef4444'
        }
      })
    ]);

    // Crear plantillas de sesión por defecto
    const templates = await Promise.all([
      // Consulta Inicial - 1 hora
      prisma.sessionTemplate.create({
        data: {
          title: 'Consulta Inicial Integral',
          description: 'Primera consulta completa para evaluar el estado actual del paciente y establecer un plan de tratamiento personalizado.',
          basePrice: 80.0,
          durationId: durations[2].id, // 1 hora
          specialtyId: specialties[3].id, // Educación Diabetológica
          category: 'INITIAL',
          modality: 'ONLINE'
        }
      }),
      
      // Seguimiento Nutricional - 45 min
      prisma.sessionTemplate.create({
        data: {
          title: 'Seguimiento Nutricional',
          description: 'Revisión del plan nutricional, ajustes en la dieta y resolución de dudas alimentarias.',
          basePrice: 50.0,
          durationId: durations[1].id, // 45 minutos
          specialtyId: specialties[1].id, // Nutrición
          category: 'FOLLOW_UP',
          modality: 'ONLINE'
        }
      }),

      // Control Glucémico - 30 min
      prisma.sessionTemplate.create({
        data: {
          title: 'Control de Glucemia',
          description: 'Revisión de niveles de glucosa, ajuste de medicación y análisis de patrones glucémicos.',
          basePrice: 60.0,
          durationId: durations[0].id, // 30 minutos
          specialtyId: specialties[0].id, // Control Glucémico
          category: 'FOLLOW_UP',
          modality: 'ONLINE'
        }
      }),

      // Apoyo Psicológico - 1 hora
      prisma.sessionTemplate.create({
        data: {
          title: 'Sesión de Apoyo Psicológico',
          description: 'Apoyo emocional y estrategias psicológicas para el manejo del estrés y la ansiedad relacionada con la diabetes.',
          basePrice: 70.0,
          durationId: durations[2].id, // 1 hora
          specialtyId: specialties[2].id, // Apoyo Psicológico
          category: 'PSYCHOLOGY',
          modality: 'ONLINE'
        }
      }),

      // Educación Grupal - 1.5 horas
      prisma.sessionTemplate.create({
        data: {
          title: 'Taller Educativo Grupal',
          description: 'Sesión educativa grupal sobre manejo de la diabetes, dirigida a pacientes y familias.',
          basePrice: 25.0,
          durationId: durations[3].id, // 1 hora 30 minutos
          specialtyId: specialties[3].id, // Educación Diabetológica
          category: 'GROUP',
          modality: 'ONLINE'
        }
      }),

      // Emergencia - 30 min
      prisma.sessionTemplate.create({
        data: {
          title: 'Consulta de Urgencia',
          description: 'Consulta rápida para situaciones urgentes relacionadas con el manejo de la diabetes.',
          basePrice: 100.0,
          durationId: durations[0].id, // 30 minutos
          category: 'EMERGENCY',
          modality: 'ONLINE'
        }
      })
    ]);

    console.log('✅ Session system seeded successfully:', {
      durations: durations.length,
      specialties: specialties.length,
      templates: templates.length
    });

    return NextResponse.json({
      message: 'Sistema de sesiones poblado exitosamente',
      data: {
        durations: durations.length,
        specialties: specialties.length,
        templates: templates.length
      }
    });

  } catch (error) {
    console.error('❌ Error seeding session system:', error);
    return NextResponse.json(
      { error: 'Error al poblar sistema de sesiones' },
      { status: 500 }
    );
  }
}
