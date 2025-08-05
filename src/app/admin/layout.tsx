import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel de Administración - Diabify 2.0',
  description: 'Panel de administración para gestión de profesionales y contenido',
  robots: 'noindex, nofollow', // No indexar páginas de admin
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}
