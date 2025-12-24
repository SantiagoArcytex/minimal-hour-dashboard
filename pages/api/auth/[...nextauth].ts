// NextAuth.js configuration
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        // Support multiple admin accounts
        // Format: ADMIN_ACCOUNTS=email1:password1,email2:password2,email3:password3
        // Or use legacy single account: ADMIN_EMAIL and ADMIN_PASSWORD
        const adminAccountsEnv = process.env.ADMIN_ACCOUNTS;
        const legacyEmail = process.env.ADMIN_EMAIL;
        const legacyPassword = process.env.ADMIN_PASSWORD;

        // Parse admin accounts from environment variable
        const adminAccounts: Array<{ email: string; password: string }> = [];

        // First, check for new multi-account format
        if (adminAccountsEnv) {
          const accounts = adminAccountsEnv.split(',').map((account) => {
            const [email, password] = account.trim().split(':');
            return { email: email?.trim(), password: password?.trim() };
          });
          
          adminAccounts.push(...accounts.filter((acc) => acc.email && acc.password));
        }

        // Fallback to legacy single account format for backward compatibility
        if (legacyEmail && legacyPassword) {
          adminAccounts.push({ email: legacyEmail, password: legacyPassword });
        }

        if (adminAccounts.length === 0) {
          throw new Error('Admin credentials not configured. Set ADMIN_ACCOUNTS or ADMIN_EMAIL/ADMIN_PASSWORD');
        }

        // Check if credentials match any admin account
        const matchedAccount = adminAccounts.find(
          (account) =>
            account.email === credentials.email &&
            account.password === credentials.password
        );

        if (matchedAccount) {
          return {
            id: matchedAccount.email, // Use email as ID for uniqueness
            email: matchedAccount.email,
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'development-secret-change-in-production'),
};

export default NextAuth(authOptions);

