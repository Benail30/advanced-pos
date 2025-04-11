'use client';

import { useState } from 'react';
import { Search, UserPlus, Star, History, Tag, Filter, MessageSquare, Edit, Trash2, Award } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  totalSpent: number;
  lastPurchase: string;
  segment: 'regular' | 'premium' | 'vip';
  notes: string[];
  purchaseHistory: {
    date: string;
    amount: number;
    items: number;
  }[];
  discounts: {
    type: 'percentage' | 'fixed';
    value: number;
    validUntil: string;
  }[];
}

interface CustomerManagementProps {
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
  onNewCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onAddNote: (customerId: string, note: string) => void;
}

export function CustomerManagement({ 
  customers, 
  onCustomerSelect, 
  onNewCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onAddNote
}: CustomerManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [newNote, setNewNote] = useState('');

  const segments = ['all', 'regular', 'premium', 'vip'];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);

    const matchesSegment = segmentFilter === 'all' || customer.segment === segmentFilter;

    return matchesSearch && matchesSegment;
  });

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    onCustomerSelect(customer);
  };

  const handleAddNote = () => {
    if (selectedCustomer && newNote.trim()) {
      onAddNote(selectedCustomer.id, newNote);
      setNewNote('');
    }
  };

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
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {segments.map(segment => (
                <option key={segment} value={segment}>
                  {segment === 'all' ? 'All Segments' : segment.charAt(0).toUpperCase() + segment.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={onNewCustomer}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              <UserPlus className="w-4 h-4" />
              New Customer
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Customers</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredCustomers.map(customer => (
              <div
                key={customer.id}
                onClick={() => handleCustomerSelect(customer)}
                className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition-colors ${
                  selectedCustomer?.id === customer.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{customer.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSegmentColor(customer.segment)}`}>
                        {customer.segment.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{customer.loyaltyPoints} pts</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <History className="w-4 h-4" />
                    <span>{customer.purchaseHistory.length} purchases</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    <span>${customer.totalSpent.toFixed(2)} spent</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedCustomer && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Customer Details</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditCustomer(selectedCustomer)}
                  className="p-2 text-gray-500 hover:text-blue-500"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteCustomer(selectedCustomer.id)}
                  className="p-2 text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Loyalty Points</p>
                  <p className="font-medium">{selectedCustomer.loyaltyPoints}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="font-medium">${selectedCustomer.totalSpent.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Purchase</p>
                  <p className="font-medium">
                    {new Date(selectedCustomer.lastPurchase).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Discounts</p>
                  <p className="font-medium">{selectedCustomer.discounts.length}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Purchase History</h4>
                  <div className="space-y-2">
                    {selectedCustomer.purchaseHistory.map((purchase, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div>
                          <p>{new Date(purchase.date).toLocaleDateString()}</p>
                          <p className="text-gray-500">{purchase.items} items</p>
                        </div>
                        <p className="font-medium">${purchase.amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Active Discounts</h4>
                  <div className="space-y-2">
                    {selectedCustomer.discounts.map((discount, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div>
                          <p className="font-medium">
                            {discount.type === 'percentage' 
                              ? `${discount.value}% off` 
                              : `$${discount.value} off`}
                          </p>
                          <p className="text-gray-500">
                            Valid until {new Date(discount.validUntil).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <div className="space-y-2">
                    {selectedCustomer.notes.map((note, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
                        <p className="text-gray-600">{note}</p>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note..."
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                        className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 