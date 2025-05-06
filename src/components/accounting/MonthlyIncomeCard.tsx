
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatIDR } from '@/utils/format';

interface MonthlyIncomeCardProps {
  totalIncome: number;
  paidIncome: number;
  pendingIncome: number;
}

const MonthlyIncomeCard = ({ totalIncome, paidIncome, pendingIncome }: MonthlyIncomeCardProps) => {
  const paidPercentage = totalIncome > 0 ? Math.round((paidIncome / totalIncome) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Total Income</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatIDR(totalIncome)}</div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Paid</span>
            <span className="font-medium text-green-600">{formatIDR(paidIncome)}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full" 
              style={{ width: `${paidPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pending</span>
            <span className="font-medium text-yellow-600">{formatIDR(pendingIncome)}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-500 rounded-full" 
              style={{ width: `${totalIncome > 0 ? Math.round((pendingIncome / totalIncome) * 100) : 0}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyIncomeCard;
