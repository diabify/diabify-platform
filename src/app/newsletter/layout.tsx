import AuthWrapper from '@/components/layout/AuthWrapper';

export default function NewsletterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthWrapper>
      {children}
    </AuthWrapper>
  );
}
