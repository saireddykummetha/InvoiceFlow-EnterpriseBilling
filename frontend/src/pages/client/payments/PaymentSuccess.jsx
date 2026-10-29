import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    CheckCircle,
    ArrowRight,
    Loader2,
    FileText,
    Download
} from "lucide-react";
import api from "../../../services/api";
import { format } from "date-fns";

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const paymentId = searchParams.get("payment_id");

    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);

 

    const loadPayment = async () => {
        try {
            const response = await api.get(`/payments/${paymentId}/`);
            setPayment(response?.data?.data);
        } catch (error) {
            console.error("Failed to load payment details", error);
        } finally {
            setLoading(false);
        }
    };

       useEffect(() => {
        if (paymentId) {
            loadPayment();
        } else {
            setLoading(false);
        }
    }, [paymentId]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 border-8 border-white shadow-sm mb-6">
                    <CheckCircle className="h-12 w-12 text-emerald-600" />
                </div>

                <h1 className="text-2xl font-black text-emerald-600 mb-2">
                    Payment Successful!
                </h1>

                {payment ? (
                    <>
                        <div className="mb-2 mt-4">
                            <span className="text-3xl font-black text-slate-900">
                                ₹{Number(payment.amount || 0).toFixed(2)}
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-400 mb-8">Paid Successfully</p>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-xs font-medium text-slate-500">Invoice</span>
                                <span className="text-sm font-bold text-slate-900">{payment.invoice?.invoice_number || "-"}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-xs font-medium text-slate-500">Transaction ID</span>
                                <span className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{payment.gateway_payment_id || "-"}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-xs font-medium text-slate-500">Payment Method</span>
                                <span className="text-sm font-bold text-slate-900 uppercase">{payment.method || "-"}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-xs font-medium text-slate-500">Date</span>
                                <span className="text-sm font-bold text-slate-900">
                                    {payment.paid_at ? format(new Date(payment.paid_at), "dd MMM yyyy, hh:mm a") : "-"}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                to={`/client/invoices/${payment.invoice?.id}`}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                <FileText className="w-4 h-4" />
                                View Invoice
                            </Link>

                            <Link
                                to="/client/receipts"
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
                            >
                                <Download className="w-4 h-4" />
                                Receipts
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="mt-2 text-sm text-slate-500 mb-8">
                            Your payment has been successfully processed, but we couldn't load the receipt details right now.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Link
                                to="/client/payments"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
                            >
                                View Payments
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}