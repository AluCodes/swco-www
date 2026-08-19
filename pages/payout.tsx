import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface BalanceTransaction {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  fee: number;
  net: number;
  status: string;
  type: string;
  created: number;
  available_on: number;
  source?: string;
}

interface PayoutDetails {
  id: string;
  amount: number;
  currency: string;
  arrival_date: number;
  status: string;
  type: string;
  method: string;
  created: number;
  description: string | null;
}

interface Balance {
  available: Array<{ amount: number; currency: string }>;
  pending: Array<{ amount: number; currency: string }>;
}

interface PayoutSummary {
  payout?: PayoutDetails;
  balance?: Balance;
  transactions: BalanceTransaction[];
  summary: {
    total_amount: number;
    total_fees: number;
    total_net: number;
    transaction_count: number;
  };
}

interface TransactionTypeGroup {
  type: string;
  count: number;
  gross: number;
  fees: number;
  total: number;
}

const PayoutSummaryPage = () => {
  const router = useRouter();
  const [data, setData] = useState<PayoutSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hourlyApiKey, setHourlyApiKey] = useState<string | null>(null);

  const fetchPayoutSummary = async (apiKey: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // Get parameters from URL query
      const { po_id, limit } = router.query;

      if (limit && typeof limit === 'string') {
        params.append('limit', limit);
      } else {
        params.append('limit', '100');
      }

      if (po_id && typeof po_id === 'string') {
        params.append('po_id', po_id);
      }

      const response = await fetch(`/api/payout/summary?${params.toString()}`, {
        headers: {
          'x-internal-key': apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Sort transactions by date (ascending - oldest first)
      if (result.transactions && result.transactions.length > 0) {
        result.transactions.sort((a: BalanceTransaction, b: BalanceTransaction) => {
          return a.created - b.created;
        });
      }

      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Page-level access check, replacing the old server-side getServerSideProps
  // gate (not available in a static export) — same token, verified client-side
  // against /api/payout/verify before any summary data is requested.
  useEffect(() => {
    if (!router.isReady) return;

    const token = typeof router.query.auth === 'string' ? router.query.auth : '';

    fetch(`/api/payout/verify?auth=${encodeURIComponent(token)}`)
      .then(async (response) => {
        if (!response.ok) {
          router.push('/');
          return;
        }
        const result = await response.json();
        setHourlyApiKey(result.hourlyApiKey);
      })
      .catch(() => router.push('/'));
  }, [router.isReady, router.query.auth]);

  useEffect(() => {
    if (router.isReady && hourlyApiKey) {
      fetchPayoutSummary(hourlyApiKey);
    }
  }, [router.isReady, router.query, hourlyApiKey]);

  const formatCurrency = (amount: number, currency: string) => {
    const value = (amount / 100).toFixed(2);
    return amount < 0 ? `-$${Math.abs(amount / 100).toFixed(2)}` : `$${value}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPayoutDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getTransactionTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'charge': 'Charges',
      'payment': 'Charges',
      'refund': 'Refunds',
      'adjustment': 'Adjustments',
      'payout_minimum_balance_hold': 'Adjustments',
      'payout_minimum_balance_release': 'Adjustments',
      'contribution': 'Contributions',
      'stripe_fee': 'Stripe fees',
      //'application_fee': 'Contributions',
    };
    return typeMap[type] || 'Other';
  };

  const groupTransactionsByType = (transactions: BalanceTransaction[]): TransactionTypeGroup[] => {
    const groups: { [key: string]: TransactionTypeGroup } = {};
    
    transactions.forEach((txn) => {
      const label = getTransactionTypeLabel(txn.type);
      
      if (!groups[label]) {
        groups[label] = {
          type: label,
          count: 0,
          gross: 0,
          fees: 0,
          total: 0,
        };
      }
      
      groups[label].count += 1;
      groups[label].gross += txn.amount;
      groups[label].fees += txn.fee;
      groups[label].total += txn.net;
    });
    
    // Return in specific order
    const order = ['Charges', 'Refunds', 'Adjustments', 'Stripe fees', 'Contributions'];
    return order
      .filter(type => groups[type])
      .map(type => groups[type]);
  };

  const handleExport = () => {
    if (!data) return;
    
    // Create CSV content
    const headers = ['Type', 'Gross', 'Fee', 'Total', 'Description', 'Date'];
    const rows = data.transactions.map(txn => [
      txn.type,
      formatCurrency(txn.amount, txn.currency),
      formatCurrency(txn.fee, txn.currency),
      formatCurrency(txn.net, txn.currency),
      txn.description || '',
      formatDate(txn.created),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payout-summary-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <Head>
        <title>Payout Summary</title>
        <meta name="description" content="View payout transactions and balance summary" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 font-medium">Error: {error}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          )}

          {/* Data Display */}
          {!loading && data && (
            <div className="space-y-8">
              {/* Summary Section */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  Summary ({(() => {
                    const payoutTxn = data.transactions.find(a => a.type == "payout");
                    return payoutTxn ? formatPayoutDate(payoutTxn.available_on || payoutTxn.created) : '';
                  })()})
                </h1>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900"></th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Count</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Gross</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Fees</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(() => {
                        const groups = groupTransactionsByType(data.transactions);
                        const payoutTotal = groups.reduce((sum, group) => sum + group.total, 0);
                        
                        return (
                          <>
                            {groups.map((group) => (
                              <tr key={group.type} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{group.type}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <div className="text-sm text-gray-900">{group.count}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <div className="text-sm text-gray-900">
                                    {formatCurrency(group.gross, data.transactions[0]?.currency || 'sgd')} SGD
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <div className="text-sm text-gray-900">
                                    {formatCurrency(group.fees, data.transactions[0]?.currency || 'sgd')} SGD
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <div className="text-sm text-gray-900">
                                    {formatCurrency(group.total, data.transactions[0]?.currency || 'sgd')} SGD
                                  </div>
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50 font-semibold">
                              <td className="px-6 py-4 whitespace-nowrap" colSpan={4}>
                                <div className="text-sm text-gray-900">Payouts</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="text-sm text-gray-900">
                                  {formatCurrency(payoutTotal, data.transactions[0]?.currency || 'sgd')} SGD
                                </div>
                              </td>
                            </tr>
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transactions Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Transactions</h2>
                  {/* <button
                    onClick={handleExport}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                  </button> */}
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Gross</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Fee</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        data.transactions.map((txn) => (
                          <tr key={txn.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 capitalize">
                                {txn.type.replace(/_/g, ' ')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm text-gray-900">
                                {formatCurrency(txn.amount, txn.currency)} {txn.currency.toUpperCase()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm text-gray-900">
                                {formatCurrency(txn.fee, txn.currency)} {txn.currency.toUpperCase()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm text-gray-900">
                                {formatCurrency(txn.net, txn.currency)} {txn.currency.toUpperCase()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{txn.description || '/'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm text-gray-900">{formatDate(txn.created)}</div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* No Data State */}
          {!loading && !data && !error && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No data loaded</h3>
              <p className="mt-1 text-sm text-gray-500">Add query parameters (po_id or limit) to load payout information</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PayoutSummaryPage;

