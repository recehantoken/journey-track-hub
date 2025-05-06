import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rental } from '@/types';
import { format } from 'date-fns';
import { formatIDR } from '@/utils/format';
import { cn } from '@/lib/utils';

interface RecentTransactionsCardProps {
  rentals: Rental[];
}

const RecentTransactionsCard = ({ rentals }: RecentTransactionsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {rentals.length > 0 ? (
          <div className="space-y-2">
            {rentals.map((rental) => (
              <div key={rental.id} className="flex justify-between items-center border-b py-2 last:border-0">
                <div>
                  <p className="font-medium">{rental.renter_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(rental.created_at), 'PPP')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatIDR(rental.payment_price)}</p>
                  <span
                    className={cn(
                      'text-xs',
                      rental.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    )}
                  >
                    {rental.payment_status.charAt(0).toUpperCase() + rental.payment_status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No recent transactions.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactionsCard;