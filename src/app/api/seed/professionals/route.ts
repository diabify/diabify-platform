import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/seed/professionals - Crear datos de prueba
export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Seeding professionals data...');

    // Crear usuarios de prueba para profesionales
    const professionalUsers = await Promise.all([
      prisma.user.create({
        data: {
          email: 'dra.martinez@diabify.com',
          name: 'Dra. Carmen Martínez',
          role: 'PROFESSIONAL',
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
        }
      }),
      prisma.user.create({
        data: {
          email: 'luis.nutricionista@diabify.com',
          name: 'Luis García Ruiz',
          role: 'PROFESSIONAL',
          avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
        }
      }),
      prisma.user.create({
        data: {
          email: 'ana.educadora@diabify.com',
          name: 'Ana Fernández López',
          role: 'PROFESSIONAL',
          avatar: 'https://images.unsplash.com/photo-1594824388875-3365ec98cd23?w=150&h=150&fit=crop&crop=face'
        }
      }),
      prisma.user.create({
        data: {
          email: 'carlos.psicologo@diabify.com',
          name: 'Carlos Mendoza',
          role: 'PROFESSIONAL',
          avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face'
        }
      }),
      prisma.user.create({
        data: {
          email: 'sofia.dietista@diabify.com',
          name: 'Sofía Rodríguez',
          role: 'PROFESSIONAL',
          avatar: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150&h=150&fit=crop&crop=face'
        }
      })
    ]);

    // Crear perfiles profesionales
    const professionals = await Promise.all([
      // Médico endocrinólogo
      prisma.professional.create({
        data: {
          userId: professionalUsers[0].id,
          type: 'MEDICO',
          description: 'Médico endocrinólogo con más de 15 años de experiencia en el tratamiento de diabetes tipo 1 y tipo 2. Especialista en terapias con insulina y nuevas tecnologías para el control glucémico.',
          experience: 15,
          rating: 4.8,
          hourlyRate: 80.0,
          verified: true,
          verifiedAt: new Date(),
          availability: {
            monday: { available: true, hours: ['09:00-13:00', '15:00-19:00'] },
            tuesday: { available: true, hours: ['09:00-13:00', '15:00-19:00'] },
            wednesday: { available: true, hours: ['09:00-13:00'] },
            thursday: { available: true, hours: ['09:00-13:00', '15:00-19:00'] },
            friday: { available: true, hours: ['09:00-13:00'] }
          },
          specialties: {
            create: [
              { diabetesType: 'TYPE_1', description: 'Especialista en diabetes tipo 1 y terapia intensiva con insulina' },
              { diabetesType: 'TYPE_2', description: 'Manejo avanzado de diabetes tipo 2 y comorbilidades' }
            ]
          }
        }
      }),

      // Nutricionista
      prisma.professional.create({
        data: {
          userId: professionalUsers[1].id,
          type: 'NUTRICIONISTA',
          description: 'Nutricionista clínico especializado en diabetes y síndrome metabólico. Experto en diseño de planes nutricionales personalizados y educación alimentaria para personas con diabetes.',
          experience: 8,
          rating: 4.6,
          hourlyRate: 45.0,
          verified: true,
          verifiedAt: new Date(),
          availability: {
            monday: { available: true, hours: ['10:00-14:00', '16:00-20:00'] },
            tuesday: { available: true, hours: ['10:00-14:00', '16:00-20:00'] },
            wednesday: { available: true, hours: ['10:00-14:00'] },
            thursday: { available: true, hours: ['10:00-14:00', '16:00-20:00'] },
            friday: { available: true, hours: ['10:00-14:00'] },
            saturday: { available: true, hours: ['10:00-14:00'] }
          },
          specialties: {
            create: [
              { diabetesType: 'TYPE_2', description: 'Nutrición terapéutica para diabetes tipo 2' },
              { diabetesType: 'PREDIABETES', description: 'Prevención de diabetes a través de la alimentación' }
            ]
          }
        }
      }),

      // Educadora en diabetes
      prisma.professional.create({
        data: {
          userId: professionalUsers[2].id,
          type: 'EDUCADOR',
          description: 'Educadora certificada en diabetes con formación en enfermería. Especialista en autocontrol, manejo de dispositivos y educación terapéutica para pacientes y familias.',
          experience: 12,
          rating: 4.9,
          hourlyRate: 35.0,
          verified: true,
          verifiedAt: new Date(),
          availability: {
            monday: { available: true, hours: ['08:00-16:00'] },
            tuesday: { available: true, hours: ['08:00-16:00'] },
            wednesday: { available: true, hours: ['08:00-16:00'] },
            thursday: { available: true, hours: ['08:00-16:00'] },
            friday: { available: true, hours: ['08:00-14:00'] }
          },
          specialties: {
            create: [
              { diabetesType: 'TYPE_1', description: 'Educación en autocontrol y manejo de insulina' },
              { diabetesType: 'INFANTIL', description: 'Educación familiar y pediátrica en diabetes' },
              { diabetesType: 'GESTATIONAL', description: 'Educación en diabetes gestacional' }
            ]
          }
        }
      }),

      // Psicólogo
      prisma.professional.create({
        data: {
          userId: professionalUsers[3].id,
          type: 'PSICOLOGO',
          description: 'Psicólogo clínico especializado en el apoyo emocional a personas con diabetes. Experto en manejo del estrés, adherencia al tratamiento y calidad de vida.',
          experience: 10,
          rating: 4.7,
          hourlyRate: 50.0,
          verified: true,
          verifiedAt: new Date(),
          availability: {
            monday: { available: true, hours: ['09:00-13:00', '15:00-19:00'] },
            tuesday: { available: true, hours: ['09:00-13:00', '15:00-19:00'] },
            wednesday: { available: true, hours: ['15:00-19:00'] },
            thursday: { available: true, hours: ['09:00-13:00', '15:00-19:00'] },
            friday: { available: true, hours: ['09:00-13:00'] }
          },
          specialties: {
            create: [
              { diabetesType: 'TYPE_1', description: 'Apoyo psicológico en diabetes tipo 1' },
              { diabetesType: 'TYPE_2', description: 'Motivación y adherencia en diabetes tipo 2' }
            ]
          }
        }
      }),

      // Dietista (no verificado aún)
      prisma.professional.create({
        data: {
          userId: professionalUsers[4].id,
          type: 'DIETISTA',
          description: 'Dietista graduada con especialización en diabetes y enfermedades metabólicas. Enfoque en la planificación de menús y recetas adaptadas.',
          experience: 5,
          rating: 4.3,
          hourlyRate: 30.0,
          verified: false, // No verificado aún
          availability: {
            monday: { available: true, hours: ['14:00-20:00'] },
            tuesday: { available: true, hours: ['14:00-20:00'] },
            wednesday: { available: true, hours: ['14:00-20:00'] },
            thursday: { available: true, hours: ['14:00-20:00'] },
            friday: { available: true, hours: ['14:00-18:00'] }
          },
          specialties: {
            create: [
              { diabetesType: 'TYPE_2', description: 'Dietas personalizadas para diabetes tipo 2' },
              { diabetesType: 'PREDIABETES', description: 'Prevención nutricional de diabetes' }
            ]
          }
        }
      })
    ]);

    // Crear algunas sesiones de ejemplo para dar historial
    const sessions = await Promise.all([
      prisma.session.create({
        data: {
          clientId: professionalUsers[0].id, // Usar un usuario existente como cliente
          professionalId: professionals[0].id,
          title: 'Consulta inicial diabetes tipo 1',
          description: 'Evaluación inicial y ajuste de tratamiento',
          scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Hace 7 días
          duration: 60,
          status: 'COMPLETED',
          price: 80.0,
          notes: 'Paciente bien controlado, ajustar dosis de insulina'
        }
      }),
      prisma.session.create({
        data: {
          clientId: professionalUsers[1].id,
          professionalId: professionals[1].id,
          title: 'Plan nutricional personalizado',
          description: 'Diseño de plan alimentario',
          scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Hace 3 días
          duration: 45,
          status: 'COMPLETED',
          price: 45.0,
          notes: 'Plan nutricional entregado, seguimiento en 2 semanas'
        }
      })
    ]);

    console.log('✅ Professionals seeded successfully:', {
      users: professionalUsers.length,
      professionals: professionals.length,
      sessions: sessions.length
    });

    return NextResponse.json({
      message: 'Datos de profesionales creados exitosamente',
      data: {
        users: professionalUsers.length,
        professionals: professionals.length,
        sessions: sessions.length
      }
    });

  } catch (error) {
    console.error('❌ Error seeding professionals:', error);
    return NextResponse.json(
      { error: 'Error al crear datos de prueba' },
      { status: 500 }
    );
  }
}
