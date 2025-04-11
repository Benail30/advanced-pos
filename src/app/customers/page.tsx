'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Mail, Phone, MapPin, Edit, Trash, UserPlus, RefreshCw, Download, Filter } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Customer } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true);
        const response = await fetch('/api/customers');
        
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        
        const data = await response.json();
        setCustomers(data);
        setFilteredCustomers(data);
      } catch (err) {
        setError('Error loading customers');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCustomers();
  }, []);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(customer => 
      customer.name.toLowerCase().includes(query) || 
      customer.email.toLowerCase().includes(query) || 
      customer.phone?.toLowerCase().includes(query) || 
      customer.address?.toLowerCase().includes(query)
    );
    
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);
  
  const handleDeleteCustomer = async (id: string) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }
      
      // Remove customer from state
      setCustomers(prev => prev.filter(customer => customer.id !== id));
      
      toast({
        title: 'Customer deleted',
        description: 'The customer has been removed successfully.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete customer. Please try again.',
        variant: 'destructive',
      });
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600-alt bg-clip-text text-transparent">
          Customer Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          View, search and manage your customer database
        </p>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search customers..."
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600-alt hover:opacity-90">
            <UserPlus className="h-4 w-4 mr-2" />
            <span>Add Customer</span>
          </Button>
        </div>
      </div>
      
      {/* Customer Data */}
      <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-800">
        <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Customer Database</CardTitle>
              <CardDescription className="mt-1">
                {filteredCustomers.length} customers found
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-500">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse bg-gray-100 dark:bg-gray-700 rounded-md" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
              <div className="text-lg font-medium mb-2">{error}</div>
              <Button variant="outline" size="sm" className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
              <div className="text-lg font-medium mb-2">No customers found</div>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                Try adjusting your search or filters
              </p>
              <Button variant="outline" size="sm">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="border-collapse w-full">
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <TableHead className="py-4 px-6 text-left font-medium text-gray-600 dark:text-gray-300">Name</TableHead>
                    <TableHead className="py-4 px-6 text-left font-medium text-gray-600 dark:text-gray-300">Contact</TableHead>
                    <TableHead className="py-4 px-6 text-left font-medium text-gray-600 dark:text-gray-300 hidden md:table-cell">Address</TableHead>
                    <TableHead className="py-4 px-6 text-right font-medium text-gray-600 dark:text-gray-300">Orders</TableHead>
                    <TableHead className="py-4 px-6 text-right font-medium text-gray-600 dark:text-gray-300">Total Spent</TableHead>
                    <TableHead className="py-4 px-6 text-right font-medium text-gray-600 dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer, index) => (
                    <TableRow 
                      key={customer.id} 
                      className={`
                        border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors
                        ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}
                      `}
                    >
                      <TableCell className="py-4 px-6 font-medium text-gray-800 dark:text-gray-200">
                        {customer.name}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <Mail className="h-3.5 w-3.5 mr-1.5 text-blue-500 dark:text-blue-400" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <Phone className="h-3.5 w-3.5 mr-1.5 text-green-500 dark:text-green-400" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 hidden md:table-cell">
                        {customer.address ? (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <MapPin className="h-3.5 w-3.5 mr-1.5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                            <span className="truncate max-w-[200px]">{customer.address}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-sm">Not provided</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <div className="font-medium text-gray-800 dark:text-gray-200">{customer.totalOrders}</div>
                        {customer.lastOrder && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Last: {formatDate(customer.lastOrder)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right font-medium text-blue-600 dark:text-blue-400">
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <div className="flex justify-end space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleDeleteCustomer(customer.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 