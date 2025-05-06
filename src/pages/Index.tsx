import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Driver, Rental, Invoice } from "@/types";
import { Button } from "@/components/ui/button";
import { showToast, showSuccessToast, showErrorToast } from "@/utils/toasts";
import { Car, Users, Calendar, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { format, startOfYear, startOfMonth } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { formatIDR } from '@/utils/format';
import { cn } from '@/lib/utils';

const COLORS = ['#2563eb', '#1e40af', '#60a5fa', '#93c5fd'];

export interface Vehicle {
  id: string;
  name: string;
  license_plate: string;
  status: 'available' | 'rented' | 'maintenance'; // Add the 'status' property
  // other properties
}

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    activeRentals: 0,
    totalRentals: 0,
    totalIncome: 0,
    monthlyIncome: 0,
    ytdIncome: 0,
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [incomeByVehicleType, setIncomeByVehicleType] = useState<
    { name: string; value: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [seedingData, setSeedingData] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("Fetching dashboard data...");

      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (vehiclesError) throw vehiclesError;
      console.log("Vehicles data:", vehiclesData);

      // Fetch drivers
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      if (driversError) throw driversError;
      console.log("Drivers data:", driversData);

      // Fetch rentals
      const { data: rentalsData, error: rentalsError } = await supabase
        .from('rentals')
        .select('*, vehicle:vehicles(*), driver:drivers(*)')
        .order('created_at', { ascending: false });

      if (rentalsError) throw rentalsError;
      console.log("Rentals data:", rentalsData);

      // Fetch invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*, rental:rentals(renter_name, vehicle:vehicles(type))')
        .order('issued_at', { ascending: false });

      if (invoicesError) throw invoicesError;
      console.log("Invoices data:", invoicesData);

      // Calculate stats
      const availableVehicles = vehiclesData ? vehiclesData.filter(v => v.status === 'available').length : 0;
      const activeDrivers = driversData ? driversData.filter(d => d.status === 'active').length : 0;

      const today = new Date().toISOString().split('T')[0];
      const activeRentals = rentalsData
        ? rentalsData.filter(r => {
            const endDate = new Date(r.end_date).toISOString().split('T')[0];
            return endDate >= today;
          }).length
        : 0;

      // Calculate income stats
      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const startOfCurrentYear = startOfYear(now);

      const totalIncome = invoicesData
        ? invoicesData.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0)
        : 0;
      const monthlyIncome = invoicesData
        ? invoicesData
            .filter(inv => inv.status === 'paid' && new Date(inv.issued_at) >= startOfCurrentMonth)
            .reduce((sum, inv) => sum + inv.amount, 0)
        : 0;
      const ytdIncome = invoicesData
        ? invoicesData
            .filter(inv => inv.status === 'paid' && new Date(inv.issued_at) >= startOfCurrentYear)
            .reduce((sum, inv) => sum + inv.amount, 0)
        : 0;

      // Calculate income by vehicle type
      const incomeByType = invoicesData
        ? invoicesData
            .filter(inv => inv.status === 'paid')
            .reduce((acc, inv) => {
              const vehicleType = inv.rental?.vehicle?.type || 'unknown';
              acc[vehicleType] = (acc[vehicleType] || 0) + inv.amount;
              return acc;
            }, {} as Record<string, number>)
        : {};
      const incomeByVehicleTypeData = Object.entries(incomeByType).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));

      // Set state
      if (vehiclesData) setVehicles(vehiclesData as Vehicle[]);
      if (driversData) setDrivers(driversData as Driver[]);
      if (rentalsData) setRentals(rentalsData as Rental[]);
      if (invoicesData) setInvoices(invoicesData as Invoice[]);
      setIncomeByVehicleType(incomeByVehicleTypeData);

      setStats({
        totalVehicles: vehiclesData ? vehiclesData.length : 0,
        availableVehicles,
        totalDrivers: driversData ? driversData.length : 0,
        activeDrivers,
        activeRentals,
        totalRentals: rentalsData ? rentalsData.length : 0,
        totalIncome,
        monthlyIncome,
        ytdIncome,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showErrorToast("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    try {
      setSeedingData(true);
      showToast("Creating sample data...");
      await fetchDashboardData();
      showSuccessToast("Sample data loaded successfully");
    } catch (error) {
      console.error('Error seeding data:', error);
      showErrorToast("Failed to create sample data");
    } finally {
      setSeedingData(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col space-y-6 p-1 sm:p-2 md:p-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.email}</p>
        </div>

        {/* Stats overview cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <Car className="h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">Total Vehicles</p>
                <h2 className="text-3xl font-bold">{stats.totalVehicles}</h2>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <p className="text-sm text-muted-foreground">Available</p>
                <h2 className="text-3xl font-bold">{stats.availableVehicles}</h2>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <Users className="h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">Total Drivers</p>
                <h2 className="text-3xl font-bold">{stats.totalDrivers}</h2>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <p className="text-sm text-muted-foreground">Active Drivers</p>
                <h2 className="text-3xl font-bold">{stats.activeDrivers}</h2>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <Calendar className="h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">Active Rentals</p>
                <h2 className="text-3xl font-bold">{stats.activeRentals}</h2>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <Clock className="h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">Total Rentals</p>
                <h2 className="text-3xl font-bold">{stats.totalRentals}</h2>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <p className="text-sm text-muted-foreground">Total Income</p>
                <h2 className="text-3xl font-bold">{formatIDR(stats.totalIncome)}</h2>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <h2 className="text-3xl font-bold">{formatIDR(stats.monthlyIncome)}</h2>
                <p className="text-xs text-muted-foreground">{format(new Date(), 'MMMM yyyy')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <p className="text-sm text-muted-foreground">Year-to-Date Income</p>
                <h2 className="text-3xl font-bold">{formatIDR(stats.ytdIncome)}</h2>
                <p className="text-xs text-muted-foreground">{format(new Date(), 'yyyy')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty state with seed data option if no data */}
        {!loading && stats.totalVehicles === 0 && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Your fleet is empty</CardTitle>
              <CardDescription>Let's add some sample data to get started</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <Button
                onClick={handleSeedData}
                disabled={seedingData}
              >
                {seedingData ? 'Creating Sample Data...' : 'Create Sample Data'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent activity tabs */}
        {stats.totalVehicles > 0 && (
          <Tabs defaultValue="vehicles" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="vehicles">Recent Vehicles</TabsTrigger>
              <TabsTrigger value="drivers">Recent Drivers</TabsTrigger>
              <TabsTrigger value="rentals">Recent Rentals</TabsTrigger>
              <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="vehicles">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    <span>Recent Vehicles</span>
                  </CardTitle>
                  <CardDescription>
                    Your most recently added vehicles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {vehicles.slice(0, 5).map(vehicle => (
                    <div key={vehicle.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{vehicle.name}</p>
                        <p className="text-sm text-muted-foreground">{vehicle.license_plate}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          vehicle.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : vehicle.status === 'rented'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {vehicle.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="drivers">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>Recent Drivers</span>
                  </CardTitle>
                  <CardDescription>
                    Your most recently added drivers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {drivers.slice(0, 5).map(driver => (
                    <div key={driver.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{driver.full_name}</p>
                        <p className="text-sm text-muted-foreground">{driver.phone_number}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          driver.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : driver.status === 'on-duty'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {driver.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rentals">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>Recent Rentals</span>
                  </CardTitle>
                  <CardDescription>
                    Your most recent rental bookings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {rentals.slice(0, 5).map(rental => (
                    <div key={rental.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{rental.destination}</p>
                        <p className="text-sm text-muted-foreground">{rental.renter_name}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          rental.payment_status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : rental.payment_status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {rental.payment_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Recent Transactions</span>
                  </CardTitle>
                  <CardDescription>
                    Your most recent invoices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {invoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <p className="text-muted-foreground text-sm sm:text-base">
                        No transactions yet.
                      </p>
                      <Button className="mt-4" asChild>
                        <Link to="/rentals/new">Create New Rental</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Issued</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoices.slice(0, 5).map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell>{invoice.invoice_number}</TableCell>
                              <TableCell>{invoice.customer_name}</TableCell>
                              <TableCell>{formatIDR(invoice.amount)}</TableCell>
                              <TableCell>
                                <span className={cn(
                                  'px-2 py-1 rounded-full text-xs',
                                  invoice.status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : invoice.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                                )}>
                                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </span>
                              </TableCell>
                              <TableCell>
                                {format(new Date(invoice.issued_at), 'PPP')}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" asChild>
                          <Link to="/invoices">View All Invoices</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Income by Vehicle Type */}
        {stats.totalVehicles > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span>Income by Vehicle Type</span>
              </CardTitle>
              <CardDescription>
                Income distribution across vehicle types
              </CardDescription>
            </CardHeader>
            <CardContent>
              {incomeByVehicleType.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <p className="text-muted-foreground text-sm sm:text-base">
                    No income data available.
                  </p>
                </div>
              ) : (
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeByVehicleType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {incomeByVehicleType.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatIDR(value)}
                        contentStyle={{
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}