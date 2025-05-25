'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, Star, History, Tag, Filter, MessageSquare, Edit, Trash2, Award } from 'lucide-react';
import { Customer } from '@/types';

interface CustomerManagementProps {
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
  onNewCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer?: (customerId: string) => void;
  onAddNote?: (customerId: string, note: string) => void;
}

export function CustomerManagement({
  customers,
  onCustomerSelect,
  onNewCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onAddNote
}: CustomerManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newNote, setNewNote] = useState('');

  // Filter customers based on search term and segment
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment;
    
    return matchesSearch && matchesSegment;
  });

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    onCustomerSelect(customer);
  };

  const handleAddNote = () => {
    if (selectedCustomer && newNote.trim() && onAddNote) {
      onAddNote(selectedCustomer.id, newNote);
      setNewNote('');
    }
  };

  // Effect to reset selected customer if it's no longer in the list
  useEffect(() => {
    if (selectedCustomer && !customers.find(c => c.id === selectedCustomer.id)) {
      setSelectedCustomer(null);
    }
  }, [customers, selectedCustomer]);

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'vip':
        return 'bg-purple-100 text-purple-800';
      case 'premium':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Customer List */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Segments</option>
              <option value="regular">Regular</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
            </select>
            <button
              onClick={onNewCustomer}
              className="bg-blue-500 text-white flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-600"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">New Customer</span>
            </button>
          </div>
        </div>
        
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Segment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    onClick={() => handleSelectCustomer(customer)}
                    className={`hover:bg-gray-50 cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">ID: {customer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                      <div className="text-sm text-gray-500">{customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.segment ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.segment === 'vip' ? 'bg-purple-100 text-purple-800' :
                          customer.segment === 'premium' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          <Award className="w-3 h-3 mr-1" />
                          {customer.segment.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCustomer(customer);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {onDeleteCustomer && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCustomer(customer.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Customer Details */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {selectedCustomer ? (
          <div>
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">{selectedCustomer.name}</h2>
              <p className="text-gray-600">{selectedCustomer.email}</p>
              <p className="text-gray-600">{selectedCustomer.phone}</p>
              {selectedCustomer.address && (
                <p className="text-gray-600 mt-2">{selectedCustomer.address}</p>
              )}
              {selectedCustomer.segment && (
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedCustomer.segment === 'vip' ? 'bg-purple-100 text-purple-800' :
                    selectedCustomer.segment === 'premium' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    <Award className="w-3 h-3 mr-1" />
                    {selectedCustomer.segment.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <h3 className="text-md font-medium text-gray-700 mb-2">Purchase History</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-lg font-bold">${selectedCustomer.totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Last Purchase</p>
                  <p className="text-lg font-bold">
                    {selectedCustomer.lastPurchase ? new Date(selectedCustomer.lastPurchase).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-md font-medium text-gray-700 mb-2 flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                Notes
              </h3>
              {selectedCustomer.notes ? (
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  {selectedCustomer.notes}
                </div>
              ) : (
                <div className="text-gray-500 text-sm italic">No notes available</div>
              )}
              
              {onAddNote && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => onEditCustomer(selectedCustomer)}
                className="flex items-center gap-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              {onDeleteCustomer && (
                <button
                  onClick={() => onDeleteCustomer(selectedCustomer.id)}
                  className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <UserPlus className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Customer Selected</h3>
              <p className="text-gray-500 mb-4">Select a customer to view details</p>
              <button
                onClick={onNewCustomer}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                New Customer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 