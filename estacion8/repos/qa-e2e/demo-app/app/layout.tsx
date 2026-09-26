import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Asistente IA — Demo QA',
  description: 'Aplicación simulada para demos de testing — Clase 8 AI for Developers 30X',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#0f172a', color: '#e2e8f0' }}>
        {children}
      </body>
    </html>
  );
}
