
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createAdminUser } from '@/utils/createAdminUser';
import { toast } from '@/components/ui/sonner';

const AdminCreator = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAdmin = async () => {
    try {
      setIsLoading(true);
      await createAdminUser('admin@admin.com', 'admin123');
      toast("Success", {
        description: "Admin user created successfully with email: admin@admin.com and password: admin123"
      });
    } catch (error: any) {
      toast("Error", {
        description: error.message || "Failed to create admin user"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Admin User</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2">
          This will create an admin user with the following credentials:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Email:</strong> admin@admin.com</li>
          <li><strong>Password:</strong> admin123</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleCreateAdmin} 
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Admin User"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminCreator;
