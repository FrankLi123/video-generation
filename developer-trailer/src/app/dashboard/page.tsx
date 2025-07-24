'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye } from 'lucide-react';
import { api } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/auth-context';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  // Removed modal state - now using dedicated page

  const { data: projects = [], refetch } = api.project.getProjects.useQuery(undefined, {
    enabled: true, // Always enabled for testing
  });

  // Test tRPC connection
  const { data: testData } = api.project.test.useQuery();
  
  // Test mutation
  const testMutation = api.project.testMutation.useMutation({
    onSuccess: (data) => {
      console.log('Test mutation success:', data);
      toast.success('Test mutation worked!');
    },
    onError: (error) => {
      console.error('Test mutation error:', error);
      toast.error('Test mutation failed');
    },
  });

  // Removed createProject logic - now handled in dedicated page

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.email || 'Test User'}</p>
            {testData && (
              <div className="text-sm text-gray-500 mt-2">
                <p>Test: {testData.message}</p>
                <p>Supabase: {testData.supabase ? 'Connected' : 'Not connected'}</p>
                <p>Env vars: {testData.envVars?.hasUrl && testData.envVars?.hasKey ? 'Set' : 'Missing'}</p>
              </div>
            )}
          </div>
                      <div className="flex space-x-2">
              <Button 
                onClick={() => testMutation.mutate({ message: 'Hello from test!' })}
                className="bg-green-500 hover:bg-green-700 text-white px-4 py-2"
              >
                Test Mutation
              </Button>
              <Button 
                asChild
                className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2"
              >
                <a href="/create-project">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Project
                </a>
              </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <p className="text-sm text-gray-600">{project.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <a href={`/projects/${project.id}`}>
                        <Eye className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No projects yet. Create your first project to get started!</p>
          </div>
        )}
      </div>

      {/* Modal removed - now using dedicated /create-project page */}
    </div>
  );
} 