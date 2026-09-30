'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { clientLogger } from '@/infrastructure/logging/client-logger';

const SVC = 'login-page';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clientLogger.info(SVC, 'Login form submitted', { username, provider: 'credentials' });
    await signIn('credentials', {
      username,
      password,
      callbackUrl: '/campaigns',
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md" data-testid="login-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">EntreVista AI</CardTitle>
          <CardDescription>Plataforma de Entrevistas Agénticas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 text-center bg-red-50 p-2 rounded" data-testid="login-error">
              {(() => { clientLogger.warn(SVC, 'Login error displayed', { errorCode: error }); return null; })()}
              Error de autenticación. Verifica tus credenciales.
            </div>
          )}

          {process.env.NEXT_PUBLIC_DEV_MODE === 'true' && (
            <form onSubmit={handleCredentialsLogin} className="space-y-3" data-testid="credentials-form">
              <Input
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="username-input"
              />
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="password-input"
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
                data-testid="credentials-login-button"
              >
                {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
              </Button>
            </form>
          )}

          {process.env.NEXT_PUBLIC_DEV_MODE !== 'true' && (
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                clientLogger.info(SVC, 'SSO login initiated', { provider: 'cognito' });
                signIn('cognito', { callbackUrl: '/campaigns' });
              }}
              data-testid="login-button"
            >
              Iniciar Sesión con SSO
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
