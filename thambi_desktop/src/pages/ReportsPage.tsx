import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/apiClient';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Type declarations to make TS happy with jspdf-autotable
declare module 'jspdf' {
    interface jsPDF {
        lastAutoTable: { finalY: number };
        autoTable: (options: any) => jsPDF;
    }
}

type OrderType = {
    id: string;
    total: number;
    subTotal: number;
    platformFee: number;
    createdAt: string;
    status: string;
};

export default function ReportsPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [loading, setLoading] = useState(true);

    const netRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = orders.length > 0 ? netRevenue / orders.length : 0;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;

    const fetchOrders = async () => {
        if (!user?.outletId) return;
        try {
            const { data } = await apiClient.get(`/orders?outletId=${user.outletId}`);
            setOrders(data);
        } catch (e) {
            console.error("Failed to fetch orders", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const handleExportExcel = () => {
        if (orders.length === 0) return alert('No data to export');
        
        const worksheetData = orders.map(o => ({
            'Order ID': o.id,
            'Date': new Date(o.createdAt).toLocaleDateString(),
            'Time': new Date(o.createdAt).toLocaleTimeString(),
            'Status': o.status,
            'SubTotal': o.subTotal,
            'Platform Fee': o.platformFee,
            'Total Amount': o.total,
            // Mock GST Data (Assuming 5% GST included)
            'GST (5%)': (o.subTotal * 0.05).toFixed(2),
        }));

        const ws = XLSX.utils.json_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
        XLSX.writeFile(wb, "Sales_Report.xlsx");
    };

    const handleExportCSV = () => {
        if (orders.length === 0) return alert('No data to export');
        
        const worksheetData = orders.map(o => ({
            'Order ID': o.id,
            'Date': new Date(o.createdAt).toLocaleDateString(),
            'Time': new Date(o.createdAt).toLocaleTimeString(),
            'Status': o.status,
            'SubTotal': o.subTotal,
            'Platform Fee': o.platformFee,
            'Total Amount': o.total,
            'GST (5%)': (o.subTotal * 0.05).toFixed(2),
        }));

        const ws = XLSX.utils.json_to_sheet(worksheetData);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Sales_Report.csv";
        link.click();
    };

    const handleExportPDF = () => {
        if (orders.length === 0) return alert('No data to export');
        
        const doc = new jsPDF();
        doc.text("Sales & GST Report", 14, 20);
        
        const tableColumn = ["Order ID", "Date", "Status", "SubTotal", "GST (5%)", "Total"];
        const tableRows: any[] = [];
        
        orders.forEach(o => {
            const ticketData = [
                o.id.slice(-6),
                new Date(o.createdAt).toLocaleDateString(),
                o.status,
                `${o.subTotal}`,
                `${(o.subTotal * 0.05).toFixed(2)}`,
                `${o.total}`,
            ];
            tableRows.push(ticketData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
        });

        doc.save("Sales_Report.pdf");
    };

    return (
        <div className="flex-1 flex flex-col pt-6 px-8 h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Reports & Exports</h1>
                <p className="text-zinc-400 text-sm mt-1">Download your sales, tax, and GST compliance reports.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Net Revenue</p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white">₹{netRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Orders</p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white">{orders.length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Average Ticket</p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white">₹{avgOrderValue.toFixed(0)}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Attention Required</p>
                    <p className="text-2xl font-black text-amber-500">{pendingOrders} Pending</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-8 min-h-0 overflow-hidden">
                {/* Reports Export Section */}
                <div className="w-full md:w-96 flex flex-col gap-6">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                Sales & Tax (GST)
                            </h2>
                            <p className="text-sm text-zinc-500 mt-1">
                                Comprehensive order data including subtotals, platform fees, and estimated 5% GST calculations.
                            </p>
                        </div>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={handleExportExcel}
                                disabled={loading}
                                className="w-full flex items-center justify-between px-4 py-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors font-semibold disabled:opacity-50"
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    Export Excel
                                </span>
                                <span className="text-[10px] font-bold opacity-75">.XLSX</span>
                            </button>
                            
                            <button 
                                onClick={handleExportPDF}
                                disabled={loading}
                                className="w-full flex items-center justify-between px-4 py-3 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-100 dark:border-red-500/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors font-semibold disabled:opacity-50"
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                    Export PDF
                                </span>
                                <span className="text-[10px] font-bold opacity-75 mr-1">.PDF</span>
                            </button>

                            <button 
                                onClick={handleExportCSV}
                                disabled={loading}
                                className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors font-semibold disabled:opacity-50"
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                    Export CSV
                                </span>
                                <span className="text-[10px] font-bold opacity-75">.CSV</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Orders Preview */}
                <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col shadow-sm overflow-hidden mb-8">
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Recent Order Data</h3>
                        <span className="text-xs text-zinc-500">Live Preview</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 dark:bg-zinc-950/50 sticky top-0 border-b border-zinc-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-zinc-500">Order ID</th>
                                    <th className="px-4 py-3 font-semibold text-zinc-500">Amount</th>
                                    <th className="px-4 py-3 font-semibold text-zinc-500">Status</th>
                                    <th className="px-4 py-3 font-semibold text-zinc-500">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {orders.slice(0, 15).map(order => (
                                    <tr key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                                        <td className="px-4 py-3 font-mono text-xs">#{order.id.slice(-6).toUpperCase()}</td>
                                        <td className="px-4 py-3 font-semibold">₹{order.total}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                order.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                                                order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                                'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-zinc-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {orders.length === 0 && (
                            <div className="py-20 text-center text-zinc-500 italic">No sales data available for this outlet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
