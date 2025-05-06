import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Download, Eye } from 'lucide-react';
import { showErrorToast } from '@/utils/toasts';
import { formatIDR } from '@/utils/format';
import { jsPDF } from 'jspdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Define and export the Invoice type
export interface Invoice {
  id: string;
  invoice_number: string;
  issued_at: string;
  due_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  rental?: {
    start_date: string;
    end_date: string;
    destination: string;
    vehicle?: {
      name: string;
      license_plate: string;
    };
    driver?: {
      full_name: string;
    };
  };
}

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*, rental:rentals(*, vehicle:vehicles(*), driver:drivers(*))')
          .order('issued_at', { ascending: false });

        if (error) throw error;
        setInvoices(data as Invoice[]);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        showErrorToast('Failed to load invoices');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const generatePDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    const rental = invoice.rental;
    const vehicle = rental?.vehicle;
    const driver = rental?.driver;

    // Header
    doc.setFontSize(18);
    doc.text('Moretrip Rentals Invoice', 20, 20);
    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoice.invoice_number}`, 20, 30);
    doc.text(`Issued: ${format(new Date(invoice.issued_at), 'PPP')}`, 20, 36);
    doc.text(`Due: ${format(new Date(invoice.due_at), 'PPP')}`, 20, 42);

    // Customer Info
    doc.setFontSize(14);
    doc.text('Billed To:', 20, 60);
    doc.setFontSize(12);
    doc.text(invoice.customer_name, 20, 68);
    doc.text(invoice.customer_phone, 20, 74);
    doc.text(invoice.customer_address || 'N/A', 20, 80);

    // Rental Details
    doc.setFontSize(14);
    doc.text('Rental Details:', 20, 100);
    doc.setFontSize(12);
    doc.text(`Vehicle: ${vehicle?.name || 'N/A'} (${vehicle?.license_plate || 'N/A'})`, 20, 108);
    doc.text(`Driver: ${driver?.full_name || 'N/A'}`, 20, 114);
    doc.text(`Start Date: ${format(new Date(rental?.start_date || ''), 'PPP')}`, 20, 120);
    doc.text(`End Date: ${format(new Date(rental?.end_date || ''), 'PPP')}`, 20, 126);
    doc.text(`Destination: ${rental?.destination || 'N/A'}`, 20, 132);

    // Amount
    doc.setFontSize(14);
    doc.text('Amount:', 20, 150);
    doc.setFontSize(12);
    doc.text(`Total: ${formatIDR(invoice.amount)}`, 20, 158);
    doc.text(`Status: ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}`, 20, 164);

    // Footer
    doc.setFontSize(10);
    doc.text('Thank you for choosing Moretrip Rentals!', 20, 280);

    doc.save(`invoice_${invoice.invoice_number}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage and view rental invoices
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p>Loading invoices...</p>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.customer_name}</TableCell>
                      <TableCell>{formatIDR(invoice.amount)}</TableCell>
                      <TableCell>
                        <span
                          className={
                            invoice.status === 'paid'
                              ? 'text-green-600'
                              : invoice.status === 'pending'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }
                        >
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{format(new Date(invoice.issued_at), 'PPP')}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedInvoice(invoice)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Invoice #{invoice.invoice_number}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h3 className="font-semibold">Customer</h3>
                                  <p>{invoice.customer_name}</p>
                                  <p>{invoice.customer_phone}</p>
                                  <p>{invoice.customer_address || 'N/A'}</p>
                                </div>
                                <div>
                                  <h3 className="font-semibold">Rental Details</h3>
                                  <p>Vehicle: {invoice.rental?.vehicle?.name || 'N/A'}</p>
                                  <p>Driver: {invoice.rental?.driver?.full_name || 'N/A'}</p>
                                  <p>Destination: {invoice.rental?.destination || 'N/A'}</p>
                                  <p>
                                    Period:{' '}
                                    {format(
                                      new Date(invoice.rental?.start_date || ''),
                                      'PPP'
                                    )}{' '}
                                    -{' '}
                                    {format(new Date(invoice.rental?.end_date || ''), 'PPP')}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="font-semibold">Amount</h3>
                                  <p>Total: {formatIDR(invoice.amount)}</p>
                                  <p>Status: {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generatePDF(invoice)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvoicesPage;