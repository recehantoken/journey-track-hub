
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showErrorToast } from '@/utils/toasts';
import { Rental } from '@/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid, Line, LineChart } from 'recharts';
import { MonthlyIncome } from '@/types';
import MonthlyIncomeCard from '@/components/accounting/MonthlyIncomeCard';
import IncomeSourcesCard from '@/components/accounting/IncomeSourcesCard';
import RecentTransactionsCard from '@/components/accounting/RecentTransactionsCard';
import { formatIDR } from '@/utils/format';

const AccountingPage = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [monthlyIncome, setMonthlyIncome] = useState<MonthlyIncome[]>([]);
  type IncomeByPeriod = {
    name: string;
    value: number;
  };

  const [incomeByType, setIncomeByType] = useState<IncomeByPeriod[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [paidIncome, setPaidIncome] = useState(0);
  const [pendingIncome, setPendingIncome] = useState(0);

  useEffect(() => {
    const fetchRentals = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('rentals')
          .select('*, vehicle:vehicles(*), driver:drivers(*)');
        
        if (error) throw error;
        
        setRentals(data as Rental[]);
        calculateIncomeData(data as Rental[]);
      } catch (error) {
        console.error('Error fetching rentals:', error);
        showErrorToast('Failed to load rental data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRentals();
  }, []);

  useEffect(() => {
    if (rentals.length > 0) {
      calculateIncomeData(rentals);
    }
  }, [period, rentals]);

  const calculateIncomeData = (rentalData: Rental[]) => {
    // Calculate total income, paid and pending
    const total = rentalData.reduce((sum, rental) => sum + rental.payment_price, 0);
    const paid = rentalData
      .filter(rental => rental.payment_status === 'paid')
      .reduce((sum, rental) => sum + rental.payment_price, 0);
    const pending = rentalData
      .filter(rental => rental.payment_status === 'pending')
      .reduce((sum, rental) => sum + rental.payment_price, 0);

    setTotalIncome(total);
    setPaidIncome(paid);
    setPendingIncome(pending);

    // Calculate monthly income for the last 6 months
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const month = subMonths(new Date(), i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthRentals = rentalData.filter(rental => {
        const rentalDate = new Date(rental.created_at);
        return rentalDate >= monthStart && rentalDate <= monthEnd;
      });
      
      const income = monthRentals.reduce((sum, rental) => sum + rental.payment_price, 0);
      
      return {
        month: format(month, 'MMM yyyy'),
        income,
        count: monthRentals.length
      };
    }).reverse();

    setMonthlyIncome(last6Months);

    // Calculate income by vehicle type
    const incomeByVehicleType = rentalData.reduce((acc, rental) => {
      const vehicleType = rental.vehicle?.type || 'unknown';
      if (!acc[vehicleType]) {
        acc[vehicleType] = 0;
      }
      acc[vehicleType] += rental.payment_price;
      return acc;
    }, {} as Record<string, number>);

    const incomeByTypeData = Object.entries(incomeByVehicleType).map(([type, amount]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: amount
    }));

    setIncomeByType(incomeByTypeData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Accounting</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track and analyze rental income
          </p>
        </div>
        <Tabs defaultValue="month" className="w-full sm:w-auto" onValueChange={(value) => setPeriod(value as 'week' | 'month' | 'year')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p>Loading accounting data...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MonthlyIncomeCard totalIncome={totalIncome} paidIncome={paidIncome} pendingIncome={pendingIncome} />
          <IncomeSourcesCard incomeByType={incomeByType} />
          <RecentTransactionsCard rentals={rentals.slice(0, 5)} />
        </div>
      )}

      {!isLoading && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Income</CardTitle>
              <CardDescription>Income from rentals over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyIncome}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${value.toLocaleString('id-ID')}`} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border border-border p-3 rounded-md shadow-md">
                              <p className="font-semibold">{label}</p>
                              <p className="text-primary">
                                Income: {formatIDR(payload[0].value as number)}
                              </p>
                              <p className="text-muted-foreground">
                                Rentals: {payload[1].value}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Income (IDR)" fill="#0ea5e9" />
                    <Bar dataKey="count" name="Number of Rentals" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Rental Duration Analysis</CardTitle>
              <CardDescription>Average rental duration and income per day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Average Rental Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {rentals.length > 0 
                        ? (rentals.reduce((sum, rental) => {
                            const start = new Date(rental.start_date);
                            const end = new Date(rental.end_date);
                            return sum + differenceInDays(end, start) + 1;
                          }, 0) / rentals.length).toFixed(1)
                        : 0} days
                    </div>
                    <p className="text-muted-foreground text-sm">Average rental duration across all bookings</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Average Daily Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {formatIDR(rentals.length > 0 
                        ? rentals.reduce((sum, rental) => {
                            const start = new Date(rental.start_date);
                            const end = new Date(rental.end_date);
                            const days = differenceInDays(end, start) + 1;
                            return sum + (rental.payment_price / days);
                          }, 0) / rentals.length
                        : 0)}
                    </div>
                    <p className="text-muted-foreground text-sm">Average income per day of rental</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AccountingPage;
