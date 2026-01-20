'use client';

import React, { useState } from 'react';
import { Plus, ClipboardList, Calendar, Clock, CheckCircle, FileText } from "lucide-react";

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700', icon: FileText },
  pending: { label: 'Pending Review', className: 'bg-amber-100 text-amber-700', icon: Clock },
  in_review: { label: 'In Review', className: 'bg-blue-100 text-blue-700', icon: Clock },
  quoted: { label: 'Quote Sent', className: 'bg-purple-100 text-purple-700', icon: FileText },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  in_progress: { label: 'In Progress', className: 'bg-indigo-100 text-indigo-700', icon: Clock },
  completed: { label: 'Completed', className: 'bg-slate-100 text-slate-700', icon: CheckCircle }
};

export default function CustomerRequests() {
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('1');
  
  // Mock user (admin for demo)
  const user = { role: 'admin', email: 'admin@example.com' };
  
  // Mock customers
  const customers = [
    { id: '1', legal_company_name: 'ABC Construction', display_name: 'ABC Construction' },
    { id: '2', legal_company_name: 'XYZ Demolition', display_name: 'XYZ Demolition' },
    { id: '3', legal_company_name: 'Smith Contractors', display_name: 'Smith Contractors' }
  ];

  // Mock data based on selected customer
  const getRequestsForCustomer = (customerId: string) => {
    const allRequests: Record<string, any[]> = {
      '1': [
        {
          id: '1',
          request_number: 'REQ-001',
          service_type: 'demolition',
          request_status: 'pending',
          preferred_date: '2024-02-15',
          created_date: '2024-01-15',
          description: 'Interior wall demolition for kitchen renovation'
        },
        {
          id: '2',
          request_number: 'REQ-002',
          service_type: 'cleanup',
          request_status: 'completed',
          preferred_date: '2024-01-20',
          created_date: '2024-01-10',
          description: 'Post-construction debris cleanup'
        }
      ],
      '2': [
        {
          id: '3',
          request_number: 'REQ-003',
          service_type: 'demolition',
          request_status: 'in_progress',
          preferred_date: '2024-02-20',
          created_date: '2024-01-25',
          description: 'Garage demolition and site preparation'
        }
      ],
      '3': []
    };
    return allRequests[customerId] || [];
  };

  const requests = getRequestsForCustomer(selectedCustomerId);

  if (showForm) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <button 
            className="mb-6 px-4 py-2 text-slate-600 hover:text-slate-900"
            onClick={() => setShowForm(false)}
          >
            ← Back to Requests
          </button>
          
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold">New Service Request</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Service Type</label>
                <select className="w-full p-2 border border-slate-300 rounded-lg">
                  <option value="">Select service type</option>
                  <option value="demolition">Demolition</option>
                  <option value="cleanup">Cleanup</option>
                  <option value="hauling">Hauling</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea 
                  className="w-full p-2 border border-slate-300 rounded-lg h-32"
                  placeholder="Describe your service request..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Date</label>
                <input 
                  type="date" 
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              
              <div className="flex gap-4">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                  Submit Request
                </button>
                <button className="px-4 py-2 border border-slate-300 rounded" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Admin Preview Selector */}
        {user?.role === 'admin' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-amber-900 mb-2">Admin Preview Mode</p>
            <select 
              value={selectedCustomerId || ''} 
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full md:w-96 bg-white p-2 border border-slate-300 rounded"
            >
              <option value="">Select customer to preview</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.legal_company_name || c.display_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Service Requests</h1>
            <p className="text-slate-600 mt-1">Submit and track your service requests</p>
            {user?.role === 'admin' && (
              <p className="text-sm text-amber-700 mt-1">
                Viewing as: {customers.find(c => c.id === selectedCustomerId)?.legal_company_name}
              </p>
            )}
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="p-12 text-center">
                <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Service Requests</h3>
                <p className="text-slate-600 mb-6">
                  {user?.role === 'admin' 
                    ? 'This customer hasn\'t submitted any service requests yet.' 
                    : 'You haven\'t submitted any service requests yet.'
                  }
                </p>
                <button 
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Create Your First Request
                </button>
              </div>
            </div>
          ) : (
            requests.map((request) => {
              const config = statusConfig[request.request_status as keyof typeof statusConfig] || statusConfig.pending;
              const Icon = config.icon;
              
              return (
                <div key={request.id} className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            #{request.request_number}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${config.className}`}>
                            <Icon className="w-3 h-3 mr-1 inline" />
                            {config.label}
                          </span>
                        </div>
                        
                        <p className="text-slate-600 mb-2 capitalize">
                          {request.service_type?.replace(/_/g, ' ')}
                        </p>
                        
                        <p className="text-slate-700 mb-3">
                          {request.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Created: {new Date(request.created_date).toLocaleDateString()}
                          </div>
                          {request.preferred_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Preferred: {new Date(request.preferred_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="px-3 py-1 border border-slate-300 rounded text-sm">
                          View Details
                        </button>
                        {request.request_status === 'draft' && (
                          <button className="px-3 py-1 border border-slate-300 rounded text-sm">
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}