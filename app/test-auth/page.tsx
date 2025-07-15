"use client";

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  const { user, isAuthenticated, loading, refreshUser } = useAuth();

  const handleRefresh = async () => {
    console.log('🔄 Manually refreshing user...');
    const refreshedUser = await refreshUser();
    console.log('✅ Refreshed user:', refreshedUser);
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
          </div>
          
          <div>
            <strong>User:</strong>
            {user ? (
              <pre className="mt-2 p-4 bg-gray-100 rounded">
                {JSON.stringify(user, null, 2)}
              </pre>
            ) : (
              <span className="ml-2">No user</span>
            )}
          </div>

          <div>
            <strong>Local Storage Token:</strong>
            <span className="ml-2">
              {typeof window !== 'undefined' ? 
                (localStorage.getItem('auth-token') ? 'Present' : 'Not found') :
                'Server-side'
              }
            </span>
          </div>

          <Button onClick={handleRefresh}>
            Refresh User Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
