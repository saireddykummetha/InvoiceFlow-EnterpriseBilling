// import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    XCircle,
    ArrowLeft,
    RefreshCcw
} from "lucide-react";

export default function PaymentFailed() {
    const [searchParams] = useSearchParams();
    const amount = searchParams.get("amount");

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-50 border-8 border-white shadow-sm mb-6">
                    <XCircle className="h-12 w-12 text-red-600" />
                </div>

                <h1 className="text-2xl font-black text-slate-900 mb-2">
                    Payment Failed
                </h1>

                {amount && (
                    <div className="mb-6">
                        <span className="text-3xl font-black text-slate-900">
                            ₹{Number(amount || 0).toFixed(2)}
                        </span>
                    </div>
                )}

                <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-8 text-sm">
                    <p className="font-semibold mb-1">Your payment could not be completed.</p>
                    <p className="text-xs opacity-90">No amount was deducted from your account.</p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Try Again
                    </button>

                    <Link
                        to="/client/invoices"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Invoice
                    </Link>
                </div>
            </div>
        </div>
    );
}