import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatIDR } from '@/utils/format';

interface MonthlyIncomeCardProps {
  totalIncome: number;
  paidIncome: number;
  pendingIncome: number;
}

const MonthlyIncomeCard = ({ totalIncome, paidIncome, pendingIncome }: MonthlyIncomeCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Income Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Income</span>
            <span className="font-semibold">{formatIDR(totalIncome)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Paid</span>
            <span className="font-semibold text-green-600">{formatIDR(paidIncome)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Pending</span>
            <span className="font-semibold text-yellow-600">{formatIDR(pendingIncome)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyIncomeCard;