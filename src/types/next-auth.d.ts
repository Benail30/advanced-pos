import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'admin' | 'cashier';
      storeId: string;
    }
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'cashier';
    storeId: string;
  }
} 