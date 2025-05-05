import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

const NewRentalPage = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    navigate('/rentals');
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-red-600">Error</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 w-full sm:w-auto"
        >
          Retry
        </Button>
      </div>
    );
  }

  console.log('Rendering NewRentalPage');

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Create New Rental</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Add a new rental booking</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">New Rental Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="renter_name">Renter Name</Label>
                  <Input
                    id="renter_name"
                    name="renter_name"
                    className="h-10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="renter_phone">Renter Phone</Label>
                  <Input
                    id="renter_phone"
                    name="renter_phone"
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" className="w-full sm:w-auto">Create Rental</Button>
              <Button variant="outline" onClick={() => navigate('/rentals')} className="w-full sm:w-auto">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewRentalPage;