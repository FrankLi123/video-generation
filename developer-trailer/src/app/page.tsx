'use client';

import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function HomePage() {
  // 测试tRPC查询
  const userStats = api.user.getStats.useQuery();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Developer Trailer Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {userStats.data?.totalUsers ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {userStats.data?.totalProjects ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Videos Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {userStats.data?.totalVideosGenerated ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credits Used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {userStats.data?.totalCreditsUsed ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button 
          onClick={() => toast.success('Hello from Developer Trailer!')}
          className="mr-4"
        >
          Test Toast
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => userStats.refetch()}
          disabled={userStats.isLoading}
        >
          {userStats.isLoading ? 'Loading...' : 'Refresh Stats'}
        </Button>
      </div>
    </div>
  );
}