import {
    RefreshCw,
    Users,
    IndianRupee,
    FileText,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import useReports from "../../hooks/useReports";
import useSettings from "../../hooks/useSettings";


const numberValue = (value) => {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
};





export default function ClientReport() {
    const { formatCurrency: currency } = useSettings();
    const {
        clients,
        loading,
        error,
        loadClients,
    } = useReports();

    const [period, setPeriod] =
        useState("This Month");


    useEffect(() => {
        loadClients({
            period,
        });
    }, [loadClients, period]);


    const report =
        clients?.data ?? clients;


    const clientData = useMemo(() => {
        const source =
            report?.clients ??
            report?.items ??
            report?.results ??
            [];

        if (!Array.isArray(source)) {
            return [];
        }

        return source;
    }, [report]);


    const totalClients =
        numberValue(
            report?.total_clients ??
            report?.totalClients ??
            report?.count ??
            clientData.length
        );


    const totalRevenue =
        numberValue(
            report?.total_revenue ??
            report?.totalRevenue ??
            report?.revenue
        );


    const totalInvoices =
        numberValue(
            report?.total_invoices ??
            report?.totalInvoices ??
            report?.invoices
        );


    return (
        <div className="min-h-full bg-slate-50">

            <div className="border-b border-slate-200 bg-white p-6">

                <div className="flex items-center justify-end gap-2">
                    <div className="flex gap-2">

                        <select
                            value={period}
                            onChange={(e) =>
                                setPeriod(
                                    e.target.value
                                )
                            }
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
                        >

                            <option>
                                This Week
                            </option>

                            <option>
                                This Month
                            </option>

                            <option>
                                Last Month
                            </option>

                            <option>
                                This Year
                            </option>

                        </select>

                        <button
                            type="button"
                            onClick={() =>
                                loadClients({
                                    period,
                                })
                            }
                            className="rounded-xl border border-slate-200 bg-white p-2.5"
                        >

                            <RefreshCw
                                size={18}
                                className={
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                        </button>

                    </div>

                </div>

            </div>


            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">

                <Card
                    icon={Users}
                    title="Total Clients"
                    value={totalClients}
                />

                <Card
                    icon={FileText}
                    title="Total Invoices"
                    value={totalInvoices}
                />

                <Card
                    icon={IndianRupee}
                    title="Client Revenue"
                    value={currency(
                        totalRevenue
                    )}
                />

            </div>


            <div className="p-6">

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                    <div className="border-b border-slate-200 p-5">

                        <h2 className="font-bold text-slate-900">
                            Clients
                        </h2>

                    </div>


                    {clientData.length > 0 ? (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead>

                                    <tr className="border-b border-slate-200 bg-slate-50">

                                        <th className="px-5 py-3 text-left text-xs font-bold text-slate-500">
                                            Client
                                        </th>

                                        <th className="px-5 py-3 text-left text-xs font-bold text-slate-500">
                                            Email
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-bold text-slate-500">
                                            Invoices
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-bold text-slate-500">
                                            Revenue
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {clientData.map(
                                        (client, index) => (
                                            <tr
                                                key={
                                                    client.id ??
                                                    index
                                                }
                                                className="border-b border-slate-100"
                                            >

                                                <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                                                    {client.name ??
                                                        client.company_name ??
                                                        client.companyName ??
                                                        "-"}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-500">
                                                    {client.email ??
                                                        "-"}
                                                </td>

                                                <td className="px-5 py-4 text-right text-sm text-slate-700">
                                                    {numberValue(
                                                        client.invoices ??
                                                        client.invoice_count
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-right text-sm font-bold text-slate-900">
                                                    {currency(
                                                        client.revenue ??
                                                        client.total_revenue
                                                    )}
                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">

                            {loading
                                ? "Loading..."
                                : error ||
                                "No client data available."}

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}


function Card({
    icon: Icon,
    title,
    value,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="flex items-center gap-3">

                <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                    <Icon size={19} />
                </div>

                <p className="text-sm text-slate-500">
                    {title}
                </p>

            </div>

            <p className="mt-4 text-2xl font-black text-slate-900">
                {value}
            </p>

        </div>
    );
}