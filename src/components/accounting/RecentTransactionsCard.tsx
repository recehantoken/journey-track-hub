
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Rental } from '@/types';
import { formatIDR } from '@/utils/format';
import { cn } from '@/lib/utils';

interface RecentTransactionsCardProps {
  rentals: Rental[];
}

const RecentTransactionsCard = ({ rentals }: RecentTransactionsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rentals.length > 0 ? (
            rentals.map((rental) => (
              <div key={rental.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {rental.renter_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{rental.renter_name}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(rental.created_at), 'PPP')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatIDR(rental.payment_price)}</p>
                  <span
                    className={cn(
                      'inline-flex text-xs rounded-full px-2 py-0.5',
                      rental.payment_status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : rental.payment_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    )}
                  >
                    {rental.payment_status.charAt(0).toUpperCase() + rental.payment_status.slice(1)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex h-full items-center justify-center py-4">
              <p className="text-muted-foreground">No recent transactions</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactionsCard;
