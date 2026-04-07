import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/apiClient';
import * as XLSX from 'xlsx';

type Customer = {
    id: string;
    name: string;
    phone: string;
    createdAt: string;
};

export default function CustomersPage() {
    const { user } = useAuth();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const filteredCustomers = customers.filter(c => 
        (c.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        c.phone.includes(searchTerm)
    );

    const totalCustomers = customers.length;
    const newToday = customers.filter(c => 
        new Date(c.createdAt).toDateString() === new Date().toDateString()
    ).length;

    const fetchCustomers = async () => {
        try {
            const { data } = await apiClient.get('/customers');
            setCustomers(data);
        } catch (e) {
            console.error("Failed to fetch customers", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [user]);

    const handleExportCSV = () => {
        if (customers.length === 0) return alert('No data to export');
        
        const worksheetData = customers.map(c => ({
            'Customer ID': c.id,
            'Name': c.name,
            'Phone Number': c.phone,
            'Added On': new Date(c.createdAt).toLocaleDateString(),
        }));

        const ws = XLSX.utils.json_to_sheet(worksheetData);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Customer_Data_Pool.csv";
        link.click();
    };

    const handleExportExcel = () => {
        if (customers.length === 0) return alert('No data to export');
        
        const worksheetData = customers.map(c => ({
            'Customer ID': c.id,
            'Name': c.name,
            'Phone Number': c.phone,
            'Added On': new Date(c.createdAt).toLocaleDateString(),
        }));

        const ws = XLSX.utils.json_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Customers");
        XLSX.writeFile(wb, "Customer_Data_Pool.xlsx");
    };

    return (
        <div className="flex-1 flex flex-col pt-6 px-8 h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">CRM & Customers</h1>
                    <p className="text-zinc-400 text-sm mt-1">Manage and export your customer pool for marketing.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleExportCSV}
                        className="text-sm px-4 py-2 bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 font-semibold rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors border border-zinc-300 dark:border-zinc-700 shadow-sm"
                    >
                        Export CSV
                    </button>
                    <button 
                        onClick={handleExportExcel}
                        className="text-sm px-4 py-2 bg-accent text-zinc-900 font-bold rounded-lg hover:bg-lime-400 transition-colors shadow-sm"
                    >
                        Export Excel
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Customer Pool</p>
                    <p className="text-3xl font-black text-zinc-900 dark:text-white">{totalCustomers}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">New Signups (Today)</p>
                    <p className="text-3xl font-black text-emerald-500">{newToday}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex flex-col justify-center">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search by name or phone..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-all"
                        />
                        <div className="absolute right-3 top-3 text-zinc-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-8">
                {loading ? (
                    <div className="flex items-center justify-center p-12 text-zinc-500">Loading customers...</div>
                ) : customers.length === 0 ? (
                    <div className="flex items-center justify-center p-12 text-zinc-500">No customers found.</div>
                ) : (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-100 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Phone Number</th>
                                    <th className="px-6 py-4">Added On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {filteredCustomers.map(c => (
                                    <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                                            {c.name || 'Anonymous'}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                            <span className="font-mono">{c.phone}</span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                            {new Date(c.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
