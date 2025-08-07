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
import { Heart, Menu, User, LogOut, Settings, Calendar, Home, Shield } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Header() {
  const { user, isLoading, isAuthenticated, logout } = useUser();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isAdminSession, setIsAdminSession] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Detectar sesión admin
  useEffect(() => {
    if (typeof window === 'undefined') return; // Evitar ejecución en SSR
    
    const adminToken = searchParams.get('token');
    if (adminToken) {
      // Verificar si estamos en una sesión admin válida
      fetch('/api/admin/verify-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminToken })
      })
      .then(res => res.json())
      .then(data => {
        if (data.authorized) {
          setAdminUser(data.user);
          setIsAdminSession(true);
        }
      })
      .catch(() => {
        setIsAdminSession(false);
        setAdminUser(null);
      });
    } else {
      setIsAdminSession(false);
      setAdminUser(null);
    }
  }, [searchParams]);

  const handleLogout = () => {
    logout();
  };

  const handleAdminLogout = () => {
    setIsAdminSession(false);
    setAdminUser(null);
    router.push('/');
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
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-pulse h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
          ) : isAdminSession && adminUser ? (
            // Admin session UI
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-blue-50 border border-blue-200">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      <Shield className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium leading-none text-blue-700">Administrador</p>
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">
                      {adminUser.email}
                    </p>
                    <span className="text-xs text-blue-600">✓ Sesión Admin Activa</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/admin?token=${searchParams.get('token')}`} className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Panel Admin</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAdminLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión Admin</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : isAuthenticated && user ? (
            // Regular user session UI
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
            // No session - login/register buttons
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
