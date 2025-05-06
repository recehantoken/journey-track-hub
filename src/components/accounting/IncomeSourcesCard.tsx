import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Define and export the IncomeByPeriod type
export interface IncomeByPeriod {
  name: string;
  value: number;
}

import { formatIDR } from '@/utils/format';

interface IncomeSourcesCardProps {
  incomeByType: IncomeByPeriod[];
}

const COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const IncomeSourcesCard = ({ incomeByType }: IncomeSourcesCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Income by Vehicle Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={incomeByType}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {incomeByType.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatIDR(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeSourcesCard;