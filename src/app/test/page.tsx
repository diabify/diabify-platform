export default function TestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Test Personalizado
      </h1>
      <p className="text-gray-600 mb-8">
        Responde algunas preguntas para recibir recomendaciones personalizadas sobre servicios y recursos.
      </p>
      
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-purple-900 mb-2">
          🧪 Evaluación Personalizada
        </h2>
        <p className="text-purple-700">
          Este wizard te guiará a través de preguntas sobre tu tipo de diabetes, 
          objetivos y necesidades para recomendarte los mejores profesionales y recursos.
        </p>
      </div>
    </div>
  );
}
