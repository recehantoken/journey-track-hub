
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { IncomeByPeriod } from '@/types';
import { formatIDR } from '@/utils/format';

interface IncomeSourcesCardProps {
  incomeByType: IncomeByPeriod[];
}

const IncomeSourcesCard = ({ incomeByType }: IncomeSourcesCardProps) => {
  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Income by Vehicle Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-44">
          {incomeByType.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {incomeByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatIDR(value as number)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeSourcesCard;
