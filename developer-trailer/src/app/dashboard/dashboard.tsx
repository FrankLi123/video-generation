'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const { data: projects = [], refetch } = api.project.getProjects.useQuery(undefined, {
    enabled: true, // Always enabled for testing
  });

  // Test tRPC connection
  const { data: testData } = api.project.test.useQuery();

  const createProject = api.project.createProject.useMutation({
    onSuccess: () => {
      toast.success('Project created successfully!');
      setIsModalOpen(false);
      setFormData({ title: '', description: '' });
      refetch();
    },
    onError: (error) => {
      console.error('Create project error:', error);
      toast.error('Failed to create project');
    },
  });



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form data:', formData);
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        personalPhotoUrl: null,
        productImages: ['https://via.placeholder.com/300x200'], // Dummy image for testing
      };
      
      console.log('Submitting project data:', projectData);
      
      await createProject.mutateAsync(projectData);
    } catch (error) {
      console.error('Create project error:', error);
      toast.error('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Temporarily bypass auth check for testing milestone 3
  // TODO: Re-enable after milestone 3 testing
  /*
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <Button asChild>
            <a href="/">Go to Sign In</a>
          </Button>
        </div>
      </div>
    );
  }
  */

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
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">Total Projects</h3>
              <p className="text-3xl font-bold text-blue-600">{projects.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">Videos Generated</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">Credits Used</h3>
              <p className="text-3xl font-bold text-purple-600">0</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
          {projects.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500 mb-4">No projects yet</p>
                <Button onClick={() => setIsModalOpen(true)}>
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <Button 
                      asChild 
                      className="w-full bg-blue-500 hover:bg-blue-700"
                    >
                      <a href={`/projects/${project.id}`}>
                        View Project
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create New Project</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter project title"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project..."
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-500 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}