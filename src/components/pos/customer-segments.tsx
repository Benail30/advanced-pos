'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Award, Star, Gift } from 'lucide-react';

interface Segment {
  id: string;
  name: string;
  minPoints: number;
  benefits: string[];
  color: string;
}

interface LoyaltyProgram {
  id: string;
  name: string;
  pointsPerDollar: number;
  bonusMultiplier: number;
  expirationDays: number;
}

interface CustomerSegmentsProps {
  segments: Segment[];
  loyaltyProgram: LoyaltyProgram;
  onAddSegment: (segment: Omit<Segment, 'id'>) => void;
  onEditSegment: (segment: Segment) => void;
  onDeleteSegment: (segmentId: string) => void;
  onUpdateLoyaltyProgram: (program: LoyaltyProgram) => void;
}

export function CustomerSegments({
  segments,
  loyaltyProgram,
  onAddSegment,
  onEditSegment,
  onDeleteSegment,
  onUpdateLoyaltyProgram
}: CustomerSegmentsProps) {
  const [newSegment, setNewSegment] = useState<Omit<Segment, 'id'>>({
    name: '',
    minPoints: 0,
    benefits: [''],
    color: '#6B7280'
  });

  const [editingProgram, setEditingProgram] = useState<LoyaltyProgram>(loyaltyProgram);

  const handleAddBenefit = () => {
    setNewSegment(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const handleRemoveBenefit = (index: number) => {
    setNewSegment(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateBenefit = (index: number, value: string) => {
    setNewSegment(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => i === index ? value : benefit)
    }));
  };

  const handleAddSegment = () => {
    if (newSegment.name && newSegment.benefits.every(b => b.trim())) {
      onAddSegment(newSegment);
      setNewSegment({
        name: '',
        minPoints: 0,
        benefits: [''],
        color: '#6B7280'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Loyalty Program Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Loyalty Program Settings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points per Dollar
            </label>
            <input
              type="number"
              value={editingProgram.pointsPerDollar}
              onChange={(e) => setEditingProgram(prev => ({
                ...prev,
                pointsPerDollar: Number(e.target.value)
              }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bonus Multiplier
            </label>
            <input
              type="number"
              value={editingProgram.bonusMultiplier}
              onChange={(e) => setEditingProgram(prev => ({
                ...prev,
                bonusMultiplier: Number(e.target.value)
              }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="1"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points Expiration (days)
            </label>
            <input
              type="number"
              value={editingProgram.expirationDays}
              onChange={(e) => setEditingProgram(prev => ({
                ...prev,
                expirationDays: Number(e.target.value)
              }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="0"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => onUpdateLoyaltyProgram(editingProgram)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Update Program
            </button>
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Customer Segments</h2>
          </div>
          <button
            onClick={handleAddSegment}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            Add Segment
          </button>
        </div>

        {/* New Segment Form */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-4">New Segment</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Segment Name
                </label>
                <input
                  type="text"
                  value={newSegment.name}
                  onChange={(e) => setNewSegment(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Premium, VIP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Points
                </label>
                <input
                  type="number"
                  value={newSegment.minPoints}
                  onChange={(e) => setNewSegment(prev => ({ ...prev, minPoints: Number(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Benefits
              </label>
              <div className="space-y-2">
                {newSegment.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => handleUpdateBenefit(index, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                      placeholder="Enter benefit"
                    />
                    <button
                      onClick={() => handleRemoveBenefit(index)}
                      className="p-2 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddBenefit}
                  className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600"
                >
                  <Plus className="w-4 h-4" />
                  Add Benefit
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="color"
                value={newSegment.color}
                onChange={(e) => setNewSegment(prev => ({ ...prev, color: e.target.value }))}
                className="w-full h-10 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Existing Segments */}
        <div className="space-y-4">
          {segments.map(segment => (
            <div key={segment.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <h3 className="font-medium">{segment.name}</h3>
                  <span className="text-sm text-gray-500">
                    ({segment.minPoints}+ points)
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditSegment(segment)}
                    className="p-2 text-gray-500 hover:text-blue-500"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteSegment(segment.id)}
                    className="p-2 text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <ul className="space-y-1">
                {segment.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <Gift className="w-4 h-4 text-gray-400" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 