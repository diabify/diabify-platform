import Link from 'next/link';
import { Heart, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 font-bold text-xl mb-4">
              <Heart className="h-6 w-6 text-blue-400" />
              <span>Diabify</span>
              <span className="text-blue-400">2.0</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Plataforma especializada en asesoramiento y atención personalizada 
              para personas con diabetes y problemas de sobrepeso.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center text-sm text-gray-300">
                <Mail className="h-4 w-4 mr-2" />
                hola@diabify.com
              </div>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-semibold mb-4">Servicios</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/profesionales" className="hover:text-white transition-colors">Profesionales</Link></li>
              <li><Link href="/recursos" className="hover:text-white transition-colors">Recursos</Link></li>
              <li><Link href="/test" className="hover:text-white transition-colors">Test Personalizado</Link></li>
              <li><Link href="/planes" className="hover:text-white transition-colors">Planes</Link></li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/ayuda" className="hover:text-white transition-colors">Centro de Ayuda</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
              <li><Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link></li>
              <li><Link href="/terminos" className="hover:text-white transition-colors">Términos</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Diabify 2.0. Todos los derechos reservados.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">
              Hecho con ❤️ para la comunidad diabética
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
