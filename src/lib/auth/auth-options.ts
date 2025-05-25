import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema/user';

export const authOptions: NextAuthOptions = {
  providers: [], // Add your auth providers here
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.role = user.role;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.email = token.email;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
}; 