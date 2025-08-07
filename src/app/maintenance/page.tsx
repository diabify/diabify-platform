'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Construction, 
  Mail, 
  Calendar,
  CheckCircle,
  Heart
} from "lucide-react";
import { useState } from "react";
import MaintenanceHeader from "@/components/layout/MaintenanceHeader";
import MaintenanceFooter from "@/components/layout/MaintenanceFooter";

export default function MaintenancePage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          source: 'maintenance' 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsSubmitted(true);
        setEmail("");
        console.log('Suscripción exitosa:', data);
      } else {
        console.error('Error en la suscripción:', data.error);
        alert('Error al suscribirse: ' + data.error);
      }
    } catch (error) {
      console.error('Error al enviar:', error);
      alert('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <MaintenanceHeader />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Message */}
            <div className="mb-12">
              <Construction className="h-20 w-20 text-blue-600 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Estamos preparando algo increíble
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Nuestra plataforma especializada en diabetes está en desarrollo. 
                Pronto tendrás acceso a profesionales especializados y recursos personalizados.
              </p>
            </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="h-12 w-12 text-blue-600 mb-4 mx-auto" />
                <CardTitle>Atención Personalizada</CardTitle>
                <CardDescription>
                  Profesionales especializados en diabetes tipo 1, tipo 2, gestacional y prediabetes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-12 w-12 text-blue-600 mb-4 mx-auto" />
                <CardTitle>Citas Online</CardTitle>
                <CardDescription>
                  Sistema de reservas fácil y cómodo para sesiones con nutricionistas y educadores
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-blue-600 mb-4 mx-auto" />
                <CardTitle>Recursos Especializados</CardTitle>
                <CardDescription>
                  Guías, menús y contenido educativo adaptado a tus necesidades específicas
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Newsletter Signup */}
          <Card className="max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Mail className="h-5 w-5 mr-2" />
                Notifícame cuando esté listo
              </CardTitle>
              <CardDescription>
                Sé el primero en acceder a Diabify 2.0
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-600 font-medium">¡Gracias por suscribirte!</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Te notificaremos cuando lancemos la plataforma.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="flex gap-2">
                    <Input 
                      type="email" 
                      placeholder="tu@email.com" 
                      className="flex-1"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "..." : "Notificar"}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    No spam. Solo te avisaremos cuando lancemos.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              ¿Cuándo estará disponible?
            </h3>
            <p className="text-gray-600">
              Estamos trabajando intensamente para lanzar la plataforma. 
              Esperamos tener la versión beta disponible muy pronto.
            </p>
          </div>
        </div>
      </div>
    </div>
    <MaintenanceFooter />
  </>
  );
}
