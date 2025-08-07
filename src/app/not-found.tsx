import Link from 'next/link';
import { Heart, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header simple sin useSearchParams */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Diabify</span>
            <span className="text-xl font-bold text-blue-600">2.0</span>
          </div>
        </div>
      </header>

      {/* Contenido 404 */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Página no encontrada
            </h2>
            <p className="text-gray-600 mb-8">
              Lo sentimos, la página que buscas no existe o ha sido movida.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link 
              href="/"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Volver al inicio</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer simple */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 font-bold text-lg mb-4">
            <Heart className="h-5 w-5 text-blue-400" />
            <span>Diabify</span>
            <span className="text-blue-400">2.0</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 Diabify 2.0. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
