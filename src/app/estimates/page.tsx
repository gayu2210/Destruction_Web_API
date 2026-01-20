"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchEstimates, createEstimate, updateEstimate } from '@/redux/slices/estimatesSlice';
import { fetchCustomers } from '@/redux/slices/customersSlice';
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

/* UI Components */
import EstimateList from "@/components/estimates/EstimateList";
import EstimateHeader from "@/components/estimates/EstimateHeader";
import LineItemsSection from "@/components/estimates/LineItemsSection";
import OperationalChargesSection from "@/components/estimates/OperationalChargesSection";
import EstimateSummary from "@/components/estimates/EstimateSummary";
import CustomerNotesSection from "@/components/estimates/CustomerNotesSection";
import AssumptionsSection from "@/components/estimates/AssumptionsSection";

/* ======================================================
   TYPES
====================================================== */

interface Estimate {
  id?: string;
  estimate_number: string;
  customer_id: string;
  customer_name: string;
  estimate_status: "cancelled" | "sent" | "draft" | "accepted" | "expired";
  estimate_date: string;
  valid_until_date: string;
  destruction_type: string;
  primary_service_location_id: string;
  job_reference: string;
  internal_notes: string;
  estimated_volume_weight: string;
  allowed_variance: number;
  what_is_included: string;
  what_is_excluded: string;
  note_to_customer: string;
  memo_on_statement: string;
  subtotal: number;
  discount_amount: number;
  discount_type: "fixed" | "percentage";
  discount_value: number;
  taxable_subtotal: number;
  tax_amount: number;
  tax_rate: number;
  shipping_amount: number;
  total_amount: number;
}

interface Customer {
  _id?: string;
  id?: string;
  display_name?: string;
  legal_company_name?: string;
}

/* ======================================================
   PAGE
====================================================== */

function EstimatesPageContent(): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const { estimates, loading } = useSelector((state: RootState) => state.estimates);
  const { customers } = useSelector((state: RootState) => state.customers);
  const searchParams = useSearchParams();

  const [showForm, setShowForm] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [lineItemsTotal, setLineItemsTotal] = useState(0);
  const [chargesTotal, setChargesTotal] = useState(0);

  const locations: unknown[] = [];

  useEffect(() => {
    dispatch(fetchEstimates());
    dispatch(fetchCustomers());
  }, [dispatch]);

  const [formData, setFormData] = useState<Estimate>({
    estimate_number: "",
    customer_id: "",
    customer_name: "",
    estimate_status: "draft",
    estimate_date: new Date().toISOString().split("T")[0],
    valid_until_date: "",
    destruction_type: "",
    primary_service_location_id: "",
    job_reference: "",
    internal_notes: "",
    estimated_volume_weight: "",
    allowed_variance: 0,
    what_is_included: "",
    what_is_excluded: "",
    note_to_customer: "",
    memo_on_statement: "",
    subtotal: 0,
    discount_amount: 0,
    discount_type: "percentage",
    discount_value: 0,
    taxable_subtotal: 0,
    tax_amount: 0,
    tax_rate: 0,
    shipping_amount: 0,
    total_amount: 0,
  });

  /* ======================================================
     HELPERS
  ====================================================== */

  const showSuccessToast = (message: string): void => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  /* ======================================================
     ACTIONS
  ====================================================== */

  const handleAddNew = (): void => {
    const customerId = searchParams.get("customer_id");
    setEditingEstimate(null);
    setShowForm(true);

    if (customerId) {
      const customer = customers.find((c) => c._id === customerId || c.id === customerId);
      if (customer) {
        setFormData((prev) => ({
          ...prev,
          customer_id: customerId,
          customer_name:
            customer.legal_company_name || customer.display_name || "",
        }));
      }
    }
  }; 

  const handleCancel = (): void => {
    setShowForm(false);
    setEditingEstimate(null);
  };

  const handleSave = async (): Promise<void> => {
    try {
      if (editingEstimate?.id) {
        await dispatch(updateEstimate({ id: editingEstimate.id, estimate: formData as Partial<Estimate> })).unwrap();
        showSuccessToast("Estimate updated successfully.");
      } else {
        const result = await dispatch(createEstimate(formData as Partial<Estimate>)).unwrap();
        setEditingEstimate(result);
        showSuccessToast("Estimate created successfully.");
      }
    } catch (error) {
      console.error('Failed to save estimate:', error);
    }
  };

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Estimates</h1>
          {!showForm && (
            <button
              onClick={handleAddNew}
              className="h-10 px-6 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Create estimate
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <EstimateHeader
                data={formData}
                onChange={setFormData}
                customers={customers}
                locations={locations}
                errors={{}}
                isReadOnly={false}
              />

              {editingEstimate && (
                <>
                  <LineItemsSection
                    estimateId={editingEstimate.id as string}
                    onTotalChange={setLineItemsTotal}
                    isReadOnly={false}
                    estimateStatus={formData.estimate_status}
                    customerId={formData.customer_id}
                    unsavedLineItems={[]}
                    onUnsavedLineItemsChange={() => {}}
                  />

                  <OperationalChargesSection
                    estimateId={editingEstimate.id as string}
                    onTotalChange={setChargesTotal}
                    isReadOnly={false}
                    unsavedCharges={[]}
                    onUnsavedChargesChange={() => {}}
                  />

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <CustomerNotesSection
                        data={formData}
                        onChange={setFormData}
                      />
                      <AssumptionsSection
                        data={formData}
                        onChange={setFormData}
                        isReadOnly={false}
                      />
                    </div>

                    <EstimateSummary
                      data={formData}
                      onChange={setFormData}
                      lineItemsTotal={lineItemsTotal}
                      chargesTotal={chargesTotal}
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  Save
                </button>
              </div>
            </motion.div>
          ) : (
            <EstimateList
              estimates={estimates}
              customers={customers}
              isLoading={loading}
              onView={(estimate: Estimate) => {
                setEditingEstimate(estimate);
                setFormData(estimate);
                setShowForm(true);
              }}
              onSend={() => {}}
              onAccept={() => {}}
              onConvert={() => {}}
            />
          )}
        </AnimatePresence>

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function EstimatesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center"><div className="text-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-slate-500">Loading...</p></div></div>}>
      <EstimatesPageContent />
    </Suspense>
  );
}
