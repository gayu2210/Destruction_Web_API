"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

/* UI */

/* Icons */
import {
  ClipboardList,
  AlertCircle,
  FileText,
  Briefcase,
  Clock,
  Search,
  Filter,
  List,
  CalendarDays,
} from "lucide-react";

/* Components */
import CalendarView from "@/components/service-requests/CalendarView";

/* ======================================================
   TYPES
====================================================== */

type RequestStatus =
  | "pending"
  | "in_review"
  | "quoted"
  | "approved"
  | "in_progress"
  | "completed"
  | "cancelled";

type Urgency = "normal" | "expedited" | "urgent";

interface ServiceRequest {
  id: string;
  request_number: string;
  customer_id: string;
  customer_name: string;
  service_type: string;
  preferred_date: string;
  created_date: string;
  contact_phone: string;
  urgency: Urgency;
  request_status: RequestStatus;
  admin_notes?: string;
}

/* ======================================================
   CONFIG
====================================================== */

const statusConfig: Record<RequestStatus, { label: string; className: string }> =
  {
    pending: { label: "Pending Review", className: "bg-amber-100 text-amber-700" },
    in_review: { label: "In Review", className: "bg-blue-100 text-blue-700" },
    quoted: { label: "Quote Sent", className: "bg-purple-100 text-purple-700" },
    approved: { label: "Approved", className: "bg-green-100 text-green-700" },
    in_progress: { label: "In Progress", className: "bg-indigo-100 text-indigo-700" },
    completed: { label: "Completed", className: "bg-slate-100 text-slate-700" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700" },
  };

const urgencyConfig: Record<Urgency, { label: string; className: string }> = {
  normal: { label: "Normal", className: "bg-slate-100 text-slate-700" },
  expedited: { label: "Expedited", className: "bg-blue-100 text-blue-700" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700" },
};

/* ======================================================
   MOCK DATA (UI ONLY)
====================================================== */

const MOCK_REQUESTS: ServiceRequest[] = [
  {
    id: "1",
    request_number: "SR-0001",
    customer_id: "c1",
    customer_name: "Nevyo",
    service_type: "Product Disposal",
    preferred_date: "2026-01-20",
    created_date: "2026-01-10",
    contact_phone: "09957322939",
    urgency: "normal",
    request_status: "pending",
  },
];

/* ======================================================
   PAGE
====================================================== */

export default function ServiceRequestsPage() {
  const router = useRouter();

  const [selectedRequest, setSelectedRequest] =
    useState<ServiceRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const [statusFilter, setStatusFilter] =
    useState<"all" | RequestStatus>("all");
  const [urgencyFilter, setUrgencyFilter] =
    useState<"all" | Urgency>("all");
  const [customerSearch, setCustomerSearch] = useState("");

  const requests = MOCK_REQUESTS;

  /* ======================================================
     FILTER LOGIC
  ====================================================== */

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== "all" && r.request_status !== statusFilter) return false;
    if (urgencyFilter !== "all" && r.urgency !== urgencyFilter) return false;
    if (
      customerSearch &&
      !r.customer_name.toLowerCase().includes(customerSearch.toLowerCase())
    )
      return false;
    return true;
  });

  /* ======================================================
     DETAIL VIEW
  ====================================================== */

  if (selectedRequest) {
    const status = statusConfig[selectedRequest.request_status];

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button onClick={() => setSelectedRequest(null)} className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
            ← Back to Requests
          </button>

          <div className="mt-4 rounded-lg border bg-white shadow-sm">
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">
                  Request #{selectedRequest.request_number}
                </h2>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>{status.label}</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${urgencyConfig[selectedRequest.urgency].className}`}>
                  {urgencyConfig[selectedRequest.urgency].label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold">Customer</p>
                  <p>{selectedRequest.customer_name}</p>
                </div>
                <div>
                  <p className="font-semibold">Preferred Date</p>
                  <p>
                    {format(
                      parseISO(selectedRequest.preferred_date),
                      "MMM d, yyyy"
                    )}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-1">Admin Notes</p>
                <textarea
                  value={adminNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes…"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                  onClick={() =>
                    router.push(
                      `/estimates?customer_id=${selectedRequest.customer_id}`
                    )
                  }
                >
                  <FileText className="w-4 h-4" />
                  Create Estimate
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                  onClick={() =>
                    router.push(
                      `/jobs?customer_id=${selectedRequest.customer_id}`
                    )
                  }
                >
                  <Briefcase className="w-4 h-4" />
                  Create Job
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ======================================================
     LIST / CALENDAR VIEW
  ====================================================== */

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Service Requests</h1>
              <p className="text-slate-500">
                Review and respond to customer service requests
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className={`px-3 py-1 text-sm rounded-md flex items-center gap-1 transition-colors ${
                viewMode === "list" 
                  ? "bg-slate-900 text-white" 
                  : "border border-slate-200 hover:bg-slate-50"
              }`}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" /> List
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md flex items-center gap-1 transition-colors ${
                viewMode === "calendar" 
                  ? "bg-slate-900 text-white" 
                  : "border border-slate-200 hover:bg-slate-50"
              }`}
              onClick={() => setViewMode("calendar")}
            >
              <CalendarDays className="w-4 h-4" /> Calendar
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        {viewMode === "list" && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg">
              <div className="p-6 flex justify-between">
                <div>
                  <p className="text-sm text-amber-700">Pending Review</p>
                  <p className="text-3xl font-bold">
                    {requests.filter(r => r.request_status === "pending").length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg">
              <div className="p-6 flex justify-between">
                <div>
                  <p className="text-sm text-blue-700">In Review</p>
                  <p className="text-3xl font-bold">
                    {requests.filter(r => r.request_status === "in_review").length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="rounded-lg border bg-white shadow-sm">
              <div className="p-6 flex justify-between">
                <div>
                  <p className="text-sm">Total Requests</p>
                  <p className="text-3xl font-bold">{requests.length}</p>
                </div>
                <ClipboardList className="w-8 h-8 text-slate-500" />
              </div>
            </div>
          </div>
        )}

        {/* FILTERS */}
        {viewMode === "list" && (
          <div className="mb-6 rounded-lg border bg-white shadow-sm">
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                <h3 className="font-semibold">Filters</h3>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Customer Name</label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Search customer..."
                      value={customerSearch}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value as "all" | RequestStatus)}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    {Object.entries(statusConfig).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Urgency</label>
                  <select 
                    value={urgencyFilter} 
                    onChange={(e) => setUrgencyFilter(e.target.value as "all" | Urgency)}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Urgency Levels</option>
                    {Object.entries(urgencyConfig).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    className="w-full border border-slate-200 hover:bg-slate-50 px-3 py-2 text-sm rounded-md transition-colors"
                    onClick={() => {
                      setCustomerSearch("");
                      setStatusFilter("all");
                      setUrgencyFilter("all");
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIST / CALENDAR */}
        {viewMode === "calendar" ? (
          <CalendarView
            requests={filteredRequests}
            onSelectRequest={setSelectedRequest}
          />
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="p-12 text-center text-slate-500">
              No service requests found
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((r) => {
              const status = statusConfig[r.request_status];
              return (
                <div
                  key={r.id}
                  className="cursor-pointer hover:shadow-md rounded-lg border bg-white shadow-sm"
                  onClick={() => setSelectedRequest(r)}
                >
                  <div className="p-6 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">
                        Request #{r.request_number}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {r.customer_name}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>{status.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
