import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { Session } from '@auth0/nextjs-auth0';

// Force Node.js runtime
export const runtime = 'nodejs';

export const GET = handleAuth({
  callback: handleCallback({
    afterCallback: async (_req: NextApiRequest, _res: NextApiResponse, session: Session) => {
      // Return the session
      return session;
    },
  }),
});

export const POST = handleAuth(); 