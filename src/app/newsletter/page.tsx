'use client';

export default function NewsletterDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        📧 Newsletter Dashboard
      </h1>
      <p className="text-gray-600">
        Gestión de suscripciones al newsletter de Diabify 2.0 - Versión de prueba
      </p>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800">
          Dashboard funcionando correctamente. Datos cargándose...
        </p>
      </div>
    </div>
  );
}
