import Link from 'next/link';

export default function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Authentication</h1>
          <p className="mt-2 text-gray-600">
            Choose an option below to continue
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="flex w-full items-center justify-center rounded-md bg-gray-200 px-4 py-3 text-gray-700 hover:bg-gray-300"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
} 