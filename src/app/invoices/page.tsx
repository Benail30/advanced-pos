'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Eye, 
  Download, 
  Printer, 
  QrCode,
  FileText,
  Calendar,
  DollarSign,
  User,
  Filter
} from 'lucide-react';

interface Invoice {
  id: number;
  invoice_number: string;
  transaction_id: number;
  customer_name: string;
  customer_email?: string;
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount?: number;
  invoice_date: string;
  due_date?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  qr_code_data?: string;
  payment_method?: string;
  created_at: string;
}

export default function InvoicesPage() {
  const { user: auth0User, isLoading: auth0Loading } = useUser();
  const { user: localUser, isLoading: localLoading } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const isAuthenticated = !!(auth0User || localUser);
  const isLoading = auth0Loading || localLoading;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/cashier-login');
      return;
    }

    if (isAuthenticated) {
      fetchInvoices();
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invoices');
      const result = await response.json();
      
      if (result.success) {
        setInvoices(result.data);
      } else {
        console.error('Failed to fetch invoices:', result.error);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const viewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const viewQRCode = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowQRModal(true);
  };

  const printInvoice = (invoice: Invoice) => {
    // Open invoice in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.invoice_number}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .invoice-details { margin-bottom: 20px; }
              .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .items-table th { background-color: #f2f2f2; }
              .totals { text-align: right; margin-top: 20px; }
              .qr-code { text-align: center; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>INVOICE</h1>
              <h2>Advanced POS Store</h2>
              <p>123 Business Street, City, State 12345</p>
              <p>Phone: (555) 123-4567</p>
            </div>
            
            <div class="invoice-details">
              <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
              <p><strong>Date:</strong> ${new Date(invoice.invoice_date).toLocaleDateString()}</p>
              <p><strong>Customer:</strong> ${invoice.customer_name}</p>
              <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
            </div>
            
            <div class="totals">
              <p><strong>Subtotal:</strong> $${parseFloat((invoice.subtotal || 0).toString()).toFixed(2)}</p>
              <p><strong>Tax:</strong> $${parseFloat((invoice.tax_amount || 0).toString()).toFixed(2)}</p>
              <p><strong>Total:</strong> $${parseFloat((invoice.total_amount || 0).toString()).toFixed(2)}</p>
            </div>
            
            ${invoice.qr_code_data ? `
              <div class="qr-code">
                <h3>Payment Verification QR Code</h3>
                <img src="${invoice.qr_code_data}" alt="QR Code" style="width: 150px; height: 150px;" />
              </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 30px;">
              <p>Thank you for your business!</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadInvoice = async (invoice: Invoice) => {
    // This would typically generate a PDF, but for now we'll just download the data
    const invoiceData = {
      invoice_number: invoice.invoice_number,
      customer: invoice.customer_name,
      date: invoice.invoice_date,
      total: invoice.total_amount,
      status: invoice.status
    };
    
    const dataStr = JSON.stringify(invoiceData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoice.invoice_number}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoices</h1>
          <p className="text-gray-600">Manage and view all invoices with QR codes</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold">{invoices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    ${invoices.reduce((sum, inv) => {
                      const amount = Number(inv.total_amount) || 0;
                      return sum + amount;
                    }, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="w-8 h-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Paid Invoices</p>
                  <p className="text-2xl font-bold">
                    {invoices.filter(inv => inv.status === 'paid').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">
                    {invoices.filter(inv => 
                      new Date(inv.invoice_date).getMonth() === new Date().getMonth()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search invoices by number or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="sent">Sent</option>
                  <option value="draft">Draft</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Invoice #</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Customer</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Amount</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">QR Code</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{invoice.invoice_number}</div>
                        <div className="text-sm text-gray-500">ID: {invoice.id}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{invoice.customer_name}</div>
                        {invoice.customer_email && (
                          <div className="text-sm text-gray-500">{invoice.customer_email}</div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-900">
                          {new Date(invoice.invoice_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(invoice.invoice_date).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          ${parseFloat((invoice.total_amount || 0).toString()).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Tax: ${parseFloat((invoice.tax_amount || 0).toString()).toFixed(2)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        {invoice.qr_code_data ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewQRCode(invoice)}
                            className="flex items-center gap-1"
                          >
                            <QrCode className="w-4 h-4" />
                            View QR
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-sm">No QR</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewInvoice(invoice)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => printInvoice(invoice)}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadInvoice(invoice)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No invoices found</p>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code Modal */}
        {showQRModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR Code - {selectedInvoice.invoice_number}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {selectedInvoice.qr_code_data ? (
                  <div>
                    <img 
                      src={selectedInvoice.qr_code_data} 
                      alt="Invoice QR Code" 
                      className="w-64 h-64 mx-auto border border-gray-200 rounded mb-4"
                    />
                    <p className="text-sm text-gray-600 mb-4">
                      Scan this QR code to verify invoice details and payment information.
                    </p>
                    <div className="bg-gray-50 rounded p-3 text-left text-sm">
                      <p><strong>Invoice:</strong> {selectedInvoice.invoice_number}</p>
                      <p><strong>Amount:</strong> ${parseFloat((selectedInvoice.total_amount || 0).toString()).toFixed(2)}</p>
                      <p><strong>Date:</strong> {new Date(selectedInvoice.invoice_date).toLocaleDateString()}</p>
                      <p><strong>Customer:</strong> {selectedInvoice.customer_name}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No QR code available for this invoice.</p>
                )}
                
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowQRModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  {selectedInvoice.qr_code_data && (
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedInvoice.qr_code_data!;
                        link.download = `qr-${selectedInvoice.invoice_number}.png`;
                        link.click();
                      }}
                      className="flex-1"
                    >
                      Download QR
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Invoice Details Modal */}
        {showInvoiceModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Invoice Details - {selectedInvoice.invoice_number}</span>
                  <Button
                    variant="outline"
                    onClick={() => setShowInvoiceModal(false)}
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                    <p className="text-gray-900">{selectedInvoice.invoice_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <Badge className={getStatusColor(selectedInvoice.status)}>
                      {selectedInvoice.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                    <p className="text-gray-900">{selectedInvoice.customer_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                    <p className="text-gray-900">{new Date(selectedInvoice.invoice_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                    <p className="text-gray-900">${parseFloat((selectedInvoice.subtotal || 0).toString()).toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount</label>
                    <p className="text-gray-900">${parseFloat((selectedInvoice.tax_amount || 0).toString()).toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                    <p className="text-xl font-bold text-green-600">${parseFloat((selectedInvoice.total_amount || 0).toString()).toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                    <p className="text-gray-900">#{selectedInvoice.transaction_id}</p>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedInvoice.notes}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => printInvoice(selectedInvoice)}
                    className="flex-1"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => downloadInvoice(selectedInvoice)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  {selectedInvoice.qr_code_data && (
                    <Button
                      onClick={() => {
                        setShowInvoiceModal(false);
                        viewQRCode(selectedInvoice);
                      }}
                      className="flex-1"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      View QR
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 