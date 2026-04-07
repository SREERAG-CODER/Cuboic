import { useState } from 'react';

export default function IntegrationsPage() {
    const [tallySyncStatus, setTallySyncStatus] = useState<'idle' | 'syncing' | 'completed'>('idle');
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [salesLedger, setSalesLedger] = useState('Sales A/c');
    const [gstLedger, setGstLedger] = useState('GST Payable');
    const [paymentLedger, setPaymentLedger] = useState('Cash A/c');

    const handleSync = async () => {
        setTallySyncStatus('syncing');
        // Simulate an API call to sync data to Tally / ERP
        setTimeout(() => {
            setTallySyncStatus('completed');
            setLastSync(new Date().toLocaleString());
            alert('Tally integration completed successfully. All ledger entries pushed!');
            setTimeout(() => setTallySyncStatus('idle'), 3000);
        }, 2000);
    };

    return (
        <div className="flex-1 flex flex-col pt-6 px-8 h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                <p className="text-zinc-400 text-sm mt-1">Connect your ERP, Accounting, and delivery systems seamlessly.</p>
            </div>

            <div className="max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#2d1b64] rounded-lg flex items-center justify-center shadow-inner">
                            <span className="text-xl font-bold text-white">T</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Tally Integration</h2>
                            <p className="text-sm text-zinc-500">Real-time sync to your Tally ERP 9 / Prime</p>
                            {lastSync && (
                                <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-tighter">Last synced: {lastSync}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-semibold">
                            Connected
                        </div>
                        <span className="text-[10px] text-zinc-400">API Version: Prime 2.1</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold mb-3 text-zinc-700 dark:text-zinc-300">Ledger Mapping</h3>
                        <p className="text-xs text-zinc-500 mb-4">Map your Thambi transaction types to your Tally ledgers here to avoid manual entry.</p>
                        
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium w-1/3">Sales Ledger</label>
                                <input 
                                    className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-lg focus:outline-accent" 
                                    value={salesLedger}
                                    onChange={(e) => setSalesLedger(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium w-1/3">GST Input/Output</label>
                                <input 
                                    className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-lg focus:outline-accent" 
                                    value={gstLedger}
                                    onChange={(e) => setGstLedger(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium w-1/3">Payment Ledger</label>
                                <input 
                                    className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-lg focus:outline-accent" 
                                    value={paymentLedger}
                                    onChange={(e) => setPaymentLedger(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-4">
                        <button 
                            className="px-6 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium"
                        >
                            Save Mapping
                        </button>
                        <button 
                            onClick={handleSync}
                            disabled={tallySyncStatus === 'syncing'}
                            className="bg-accent text-zinc-900 border border-accent/20 font-bold px-6 py-2 rounded-lg hover:bg-lime-400 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {tallySyncStatus === 'syncing' ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Syncing...
                                </>
                            ) : tallySyncStatus === 'completed' ? (
                                'Synced!'
                            ) : (
                                'Sync Now Data to Tally'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
