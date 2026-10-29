import  { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Receipt,
  CreditCard,
  Wallet,
  ArrowRight,
  Loader2,
} from "lucide-react";
import api from "../../services/api";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    quotes: 0,
    invoices: 0,
    payments: 0,
    receipts: 0,
  });

  const loadDashboard = async () => {
    try {
      const response = await api.get("/reports/dashboard/");
      const result = response?.data?.data || {};

      setData({
        quotes: result.quotes || 0,
        invoices: result.invoices || 0,
        payments: result.payments || 0,
        receipts: result.receipts || 0,
      });
    } catch (error) {
      console.error("Client dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    loadDashboard();
  }, []);
  const cards = [
    {
      title: "Quotes",
      value: data.quotes,
      icon: FileText,
      link: "/client/quotes",
    },
    {
      title: "Invoices",
      value: data.invoices,
      icon: Receipt,
      link: "/client/invoices",
    },
    {
      title: "Payments",
      value: data.payments,
      icon: CreditCard,
      link: "/client/payments",
    },
    {
      title: "Receipts",
      value: data.receipts,
      icon: Wallet,
      link: "/client/receipts",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Client Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your quotes, invoices and payments.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                to={card.link}
                className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-indigo-50 p-3">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>

                  <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1" />
                </div>

                <p className="mt-5 text-sm text-slate-500">
                  {card.title}
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {card.value}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}