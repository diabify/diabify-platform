'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Heart, Menu, User, LogOut, Settings, Calendar, Home } from 'lucide-react';
import { useUser } from '@/hooks/useUser';

export default function Header() {
  const { user, isLoading, isAuthenticated, logout } = useUser();

  const handleLogout = () => {
    logout();
  };
  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
          <Heart className="h-6 w-6 text-blue-600" />
          <span className="text-gray-900">Diabify</span>
          <span className="text-blue-600">2.0</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/profesionales" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Profesionales
          </Link>
          {user && (
            <Link 
              href="/citas" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Mis Citas
            </Link>
          )}
          <Link 
            href="/recursos" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Recursos
          </Link>
          <Link 
            href="/test" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Test Personalizado
          </Link>
          <Link 
            href="/about" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sobre Nosotros
          </Link>
          {/* Admin Link - Solo visible en desarrollo/testing */}
          <Link 
            href="/admin" 
            className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
            title="Panel de Administración"
          >
            🔧 Admin
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-pulse h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name || ''} />
                    <AvatarFallback>
                      {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || 'Usuario'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    {user.isVerified && (
                      <span className="text-xs text-green-600">✓ Verificado</span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/user-dashboard" className="flex items-center">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/citas" className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Mis Citas</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/perfil" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Registrarse</Link>
              </Button>
            </div>
          )}
          
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
