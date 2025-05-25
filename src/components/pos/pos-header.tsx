import { UserNav } from '@/components/auth/user-nav';

export function POSHeader() {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="flex h-16 items-center px-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold">POS System</h1>
        </div>
        <div className="flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
} 