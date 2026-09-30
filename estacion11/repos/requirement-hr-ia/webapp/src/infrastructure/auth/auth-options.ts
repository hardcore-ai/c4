import type { NextAuthOptions } from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';
import CredentialsProvider from 'next-auth/providers/credentials';
import { logger } from '@/infrastructure/logging/logger';

const AUTH_SERVICE = 'auth';

const providers: NextAuthOptions['providers'] = [];

if (process.env.NODE_ENV === 'development') {
  providers.push(
    CredentialsProvider({
      name: 'Dev Credentials',
      credentials: {
        username: { label: 'Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        logger.info(AUTH_SERVICE, 'Login attempt (dev credentials)', {
          context: { username: credentials?.username, provider: 'credentials' },
        });
        if (
          credentials?.username === 'test' &&
          credentials?.password === 'test'
        ) {
          logger.info(AUTH_SERVICE, 'Login successful', {
            context: { userId: 'dev-user-001', tenantId: 'tenant-dev-001', provider: 'credentials' },
          });
          return {
            id: 'dev-user-001',
            email: 'test@entrevista.dev',
            name: 'Test User',
            tenantId: 'tenant-dev-001',
          };
        }
        logger.warn(AUTH_SERVICE, 'Login failed — invalid credentials', {
          context: { username: credentials?.username, provider: 'credentials' },
        });
        return null;
      },
    })
  );
}

providers.push(
  CognitoProvider({
    clientId: process.env.COGNITO_CLIENT_ID || '',
    clientSecret: process.env.COGNITO_CLIENT_SECRET || '',
    issuer: process.env.COGNITO_ISSUER || '',
    profile(profile) {
      return {
        id: profile.sub,
        email: profile.email,
        name: profile.name || profile.email,
        tenantId: profile['custom:tenantId'],
      };
    },
  })
);

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async jwt({ token, user, profile }) {
      if (user) {
        token.tenantId = (user as Record<string, string>).tenantId;
        logger.info(AUTH_SERVICE, 'JWT token created', {
          tenantId: token.tenantId as string,
          context: { userId: token.sub, email: token.email },
        });
      }
      if (profile) {
        token.tenantId = (profile as Record<string, string>)['custom:tenantId'];
        logger.info(AUTH_SERVICE, 'JWT token enriched from Cognito profile', {
          tenantId: (profile as Record<string, string>)['custom:tenantId'],
          context: { userId: token.sub, provider: 'cognito' },
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).tenantId = token.tenantId;
        (session.user as Record<string, unknown>).id = token.sub;
        logger.info(AUTH_SERVICE, 'Session initialized', {
          tenantId: token.tenantId as string,
          context: { userId: token.sub, email: session.user.email },
        });
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
