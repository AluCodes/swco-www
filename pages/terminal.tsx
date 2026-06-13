import React, { useState, useEffect } from 'react';
import Head from 'next/head';

// TypeScript types for Stripe Terminal
interface StripeTerminal {
  create: (config: {
    onFetchConnectionToken: () => Promise<string>;
    onUnexpectedReaderDisconnect: () => void;
  }) => any;
}

declare global {
  interface Window {
    StripeTerminal?: StripeTerminal;
  }
}

interface Reader {
  id: string;
  label: string;
  device_type: string;
  status: string;
  serial_number?: string;
  ip_address?: string;
}

interface LogMessage {
  timestamp: string;
  type: 'info' | 'success' | 'error';
  message: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: {
    id: string;
    amount: number;
    currency: string;
  } | null;
}

const StripeTerminalPage = () => {
  // State management
  const [connectionToken, setConnectionToken] = useState<any>(null);
  const [terminal, setTerminal] = useState<any>(null);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [selectedReader, setSelectedReader] = useState<Reader | null>(null);
  const [connectedReader, setConnectedReader] = useState<Reader | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [paymentIntentSecret, setPaymentIntentSecret] = useState('');
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isLoading, setIsLoading] = useState({
    initialize: false,
    discover: false,
    connect: false,
    payment: false,
    products: false,
    collect: false,
    process: false,
  });
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [paymentMethodCollected, setPaymentMethodCollected] = useState(false);

  // Load Stripe Terminal SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/terminal/v1/';
    script.async = true;
    script.onload = () => {
      addLog('info', 'Stripe Terminal SDK loaded successfully');
      setSdkLoaded(true);
    };
    script.onerror = () => {
      addLog('error', 'Failed to load Stripe Terminal SDK');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Add log message
  const addLog = async (type: 'info' | 'success' | 'error', message: string, metadata?: any) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    setLogs(prev => [...prev, { timestamp, type, message }]);

    // Send log to server for persistence
    try {
      await fetch('/api/terminal/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          message,
          timestamp,
          metadata: {
            ...metadata,
            readerId: connectedReader?.id,
            readerLabel: connectedReader?.label,
            paymentIntentId: paymentIntentId || undefined,
          },
        }),
      });
    } catch (error) {
      // Silent fail - don't disrupt user experience if logging fails
      console.error('Failed to send log to server:', error);
    }
  };

  // Fetch connection token from backend
  const fetchConnectionToken = async (): Promise<string> => {
    try {
      addLog('info', 'Fetching connection token from API');
      const response = await fetch('/api/terminal/connection-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addLog('success', 'Connection token received', data);
      setConnectionToken(data.secret);
      return data.secret;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Failed to fetch connection token: ${message}`);
      throw error;
    }
  };

  // Initialize Terminal
  const handleInitialize = async () => {
    addLog('info', 'Click Step 1');
    if (!window.StripeTerminal) {
      addLog('error', 'Step 1: Stripe Terminal SDK not loaded');
      return;
    }

    setIsLoading(prev => ({ ...prev, initialize: true }));
    try {
      addLog('info', 'Step 1:Initializing Stripe Terminal...');
      
      const terminalInstance = await window.StripeTerminal.create({
        onFetchConnectionToken: fetchConnectionToken,
        onUnexpectedReaderDisconnect: () => {
          addLog('error', 'Step 1: Reader unexpectedly disconnected');
          setConnectedReader(null);
        },
      });

      setTerminal(terminalInstance);
      addLog('success', 'Step 1: Terminal initialized successfully', terminalInstance);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Step 1: Failed to initialize terminal: ${message}`);
    } finally {
      setIsLoading(prev => ({ ...prev, initialize: false }));
    }
  };

  // Discover Readers
  const handleDiscoverReaders = async () => {
    addLog('info', 'Click Step 2');
    if (!terminal) {
      addLog('error', 'Step 2: Terminal not initialized');
      return;
    }

    setIsLoading(prev => ({ ...prev, discover: true }));
    setReaders([]);
    setSelectedReader(null);

    try {
      addLog('info', 'Step 2: Discovering readers...');
      
      const discoverResult = await terminal.discoverReaders({
        simulated: false,
      });

      addLog('info', 'Step 2: Discover result', discoverResult);

      if (discoverResult.error) {
        throw new Error(discoverResult.error.message);
      }

      const discoveredReaders = discoverResult.discoveredReaders || [];
      setReaders(discoveredReaders);
      
      if (discoveredReaders.length === 0) {
        addLog('info', 'Step 2: No readers discovered');
      } else {
        addLog('success', `Step 2: Discovered ${discoveredReaders.length} reader(s)`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Step 2: Error Failed to discover readers: ${message}`);
    } finally {
      setIsLoading(prev => ({ ...prev, discover: false }));
    }
  };

  // Connect to Reader
  const handleConnectReader = async () => {
    addLog('info', 'Click Step 3');
    if (!terminal) {
      addLog('error', 'Step 3: Terminal not initialized');
      return;
    }
    if (!selectedReader) {
      addLog('error', 'Step 3: No reader selected');
      return;
    }

    setIsLoading(prev => ({ ...prev, connect: true }));

    try {
      addLog('info', `Step 3: Connecting to reader: ${selectedReader.label || selectedReader.id}`);
      
      const connectResult = await terminal.connectReader(selectedReader);

      addLog('info', 'Step 3: Connect result', connectResult);

      if (connectResult.error) {
        throw new Error(connectResult.error.message);
      }

      setConnectedReader(connectResult.reader);
      addLog('success', `Step 3: Connected to reader: ${connectResult.reader.label || connectResult.reader.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Step 3: Error Failed to connect to reader: ${message}`);
    } finally {
      setIsLoading(prev => ({ ...prev, connect: false }));
    }
  };

  // Fetch Products
  const handleFetchProducts = async () => {
    addLog('info', 'Click Step 4A');
    setIsLoading(prev => ({ ...prev, products: true }));

    try {
      addLog('info', 'Step 4A: Fetching products from Stripe...');
      
      const response = await fetch('/api/terminal/price', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data.products || []);
      
      if (data.products.length === 0) {
        addLog('info', 'Step 4A: No active products found');
      } else {
        addLog('success', `Step 4A: Loaded ${data.products.length} product(s)`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Step 4A: Error Failed to fetch products: ${message}`);
    } finally {
      setIsLoading(prev => ({ ...prev, products: false }));
    }
  };

  // Create Payment Intent from Selected Product
  const handleCreatePaymentIntent = async () => {
    addLog('info', 'Click Step 4B');
    if (!selectedProduct || !selectedProduct.price) {
      addLog('error', 'Step 4B: Please select a product with a valid price');
      return;
    }

    setIsLoading(prev => ({ ...prev, payment: true }));

    try {
      addLog('info', `Step 4B: Creating payment intent for ${selectedProduct.name}...`);
      
      const response = await fetch('/api/terminal/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedProduct.price.amount,
          currency: selectedProduct.price.currency,
          description: selectedProduct.name,
          metadata: {
            plan: selectedProduct.name,
            product_id: selectedProduct.id,
            price_id: selectedProduct.price.id,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addLog('success', `Step 4B: Payment Intent created: ${data.id}`, data);
      setPaymentIntentId(data.id);
      setPaymentIntentSecret(data.client_secret);
      addLog('info', `Amount: ${(data.amount / 100).toFixed(2)} ${data.currency.toUpperCase()}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Step 4B: Error Failed to create payment intent: ${message}`);
    } finally {
      setIsLoading(prev => ({ ...prev, payment: false }));
    }
  };

  // Process Payment on Terminal (prompts user to tap card)
  const handleProcessPayment = async () => {
    addLog('info', 'Click Step 5');
    if (!terminal || !connectedReader) {
      addLog('error', 'Step 5: Terminal not initialized or no reader connected');
      return;
    }

    if (!paymentIntentId.trim()) {
      addLog('error', 'Step 5: Payment Intent ID is required');
      return;
    }

    setIsLoading(prev => ({ ...prev, collect: true }));

    try {
      addLog('info', 'Step 5: Initiating payment on terminal...');
      addLog('info', 'Step 5: Sending payment to reader: ' + connectedReader.label);
      
      // Call API to send payment intent to the reader
      const response = await fetch('/api/terminal/reader-process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          readerId: connectedReader.id,
          paymentIntentId: paymentIntentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to process payment on reader');
      }

      setPaymentMethodCollected(true);
      addLog('success', 'Step 5: Payment sent to reader successfully', data);
      addLog('info', 'Step 5: Please tap, insert, or swipe card on the reader');

      /*
      // Debugging - check state before calling collectPaymentMethod
      addLog('info', 'Step 5: Pre-flight checks...');
      addLog('info', `Step 5: Terminal exists: ${!!terminal}`);
      addLog('info', `Step 5: Connected reader: ${connectedReader?.label || 'None'}`);
      addLog('info', `Step 5: Payment Intent Secret length: ${paymentIntentSecret?.length || 0}`);
      addLog('info', `Step 5: Payment Intent Secret (first 20 chars): ${paymentIntentSecret?.substring(0, 20) || 'empty'}`);
      
      if (!paymentIntentSecret || paymentIntentSecret.trim() === '') {
        throw new Error('Payment Intent Secret is empty or undefined');
      }

      // collect payment method
      addLog('info', 'Step 5: Calling terminal.collectPaymentMethod...');
      const result = await terminal.collectPaymentMethod(paymentIntentSecret);
      
      // Log the raw result
      addLog('info', `Step 5: Raw result type: ${typeof result}`);
      addLog('info', `Step 5: Raw result is null: ${result === null}`);
      addLog('info', `Step 5: Raw result is undefined: ${result === undefined}`);
      addLog('info', `Step 5: Raw result keys: ${result ? Object.keys(result).join(', ') : 'N/A'}`);
      
      // Check for errors in the result
      if (result?.error) {
        throw new Error(`Failed to collect payment method: ${result.error.message}`);
      }
      
      if (!result || !result.paymentIntent) {
        throw new Error(`No payment intent returned from collectPaymentMethod. Result: ${JSON.stringify(result)}`);
      }
      
      addLog('success', 'Step 5: Payment method collected successfully');
      addLog('info', 'Step 5: Payment Intent status: ' + result.paymentIntent.status);

      // process the payment
      addLog('info', 'Step 5: Processing payment...');
      const processResult = await terminal.processPayment(result.paymentIntent);
      
      if (processResult.error) {
        throw new Error(`Failed to process payment: ${processResult.error.message}`);
      }
      
      addLog('success', 'Step 5: Payment processed successfully!');
      addLog('info', 'Final payment status: ' + processResult.paymentIntent.status);  
      */
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Step 5: Error Failed to process payment on terminal: ${message}`);
      setPaymentMethodCollected(false);
    } finally {
      setIsLoading(prev => ({ ...prev, collect: false }));
    }
  };

  // Confirm Payment via Terminal SDK (Client-Side)
  const handleConfirmPayment = async () => {
    addLog('info', 'Click Step 6');
    if (!terminal) {
      addLog('error', 'Step 6: Terminal not initialized');
      return;
    }

    if (!paymentIntentId.trim()) {
      addLog('error', 'Step 6: Payment Intent ID is required');
      return;
    }

    setIsLoading(prev => ({ ...prev, process: true }));

    const dummy_key = '';
    let currentPaymentIntent: any;

    try {
      // First check payment intent status
      addLog('info', 'Step 6: Checking payment intent status...');
      
      const statusResponse = await fetch(`/api/terminal/payment-intent?id=${paymentIntentId}`, {
        method: 'GET',
      });

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        throw new Error(errorData.error || `HTTP error! status: ${statusResponse.status}`);
      }

      currentPaymentIntent = await statusResponse.json();
      addLog('info', `Step 6: Current Payment Intent status: ${currentPaymentIntent.status}`, currentPaymentIntent);

      // Check if payment intent requires confirmation
      if (currentPaymentIntent.status !== 'requires_confirmation') {
        addLog('error', `Step 6: Payment intent status is "${currentPaymentIntent.status}". Expected "requires_confirmation"`);
        throw new Error(`Payment intent cannot be confirmed. Current status: ${currentPaymentIntent.status}`);
      }

      addLog('success', 'Step 6: Payment intent ready for confirmation');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Step 6: Error ${message}`);
    }

    try{
      // Confirm payment via Terminal SDK (client-side)
      addLog('info', 'Step 6A: Confirming payment via Stripe Payment Intent...');
      const response = await fetch(
        `https://api.stripe.com/v1/payment_intents/${currentPaymentIntent.id}/confirm`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${dummy_key}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            payment_method: `${currentPaymentIntent.payment_method}`,
          }),
        }
      );

      if (!response.ok) {
        addLog('error', 'Step 6A: Error Failed to confirm payment via Terminal SDK 1', JSON.stringify(response));      
        const errorData = await response.json();
        addLog('error', 'Step 6A: Error Failed to confirm payment via Terminal SDK 2', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addLog('success', 'Step 6A: Payment confirmed via Terminal SDK', data);
      addLog('success', `Step 6A: Success Payment completed! Status: ${currentPaymentIntent.status}`);
      addLog('info', `Step 6A: Amount: ${(currentPaymentIntent.amount / 100).toFixed(2)} ${currentPaymentIntent.currency.toUpperCase()}`);
      
      // Reset for next payment
      setPaymentIntentId('');
      setPaymentMethodCollected(false);
      setSelectedProduct(null);
      
    } catch (error) {
      addLog('error', 'Step 6A Error: Failed to confirm payment via Terminal SDK', JSON.stringify(error));
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Step 6A Error: ${message}`, JSON.stringify(message));
    }

    // method 2 - confirm payment via Stripe Terminal Reader
    setIsLoading(prev => ({ ...prev, process: true }));
    try{
      addLog('info', 'Step 6.2.1: Confirming payment via Stripe Terminal Reader...');
      const response = await fetch(
        `https://api.stripe.com/v1/terminal/readers/${selectedReader.id}/confirm_payment_intent`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${connectionToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            payment_intent: `${currentPaymentIntent.id}`,
          }),
        });


      if (!response.ok) {
        addLog('error', 'Step 6.2.2: Error Failed to confirm payment via Terminal Reader 1', JSON.stringify(response));      
        const errorData = await response.json();
        addLog('error', 'Step 6.2.3: Error Failed to confirm payment via Terminal Reader 2', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addLog('success', 'Step 6.2.4: Payment confirmed via Terminal Reader', data);
      addLog('success', `Step 6.2.5: Success Payment completed! Status: ${currentPaymentIntent.status}`);
      addLog('info', `Step 6.2.6: Amount: ${(currentPaymentIntent.amount / 100).toFixed(2)} ${currentPaymentIntent.currency.toUpperCase()}`);

      // Reset for next payment
      setPaymentIntentId('');
      setPaymentMethodCollected(false);
      setSelectedProduct(null);
    }
    catch (error) {
      addLog('error', 'Step 6.2.7: Error Failed to confirm payment via Terminal Reader', JSON.stringify(error));
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Step 6.2.8: Error ${message}`, JSON.stringify(message));
    }

    // method 3 - confirm payment via Stripe Terminal reader
    try{
      addLog('info', 'Step 6.3.1: Confirming payment via Stripe Terminal Reader...');
      const response = await fetch(
        `https://api.stripe.com/v1/terminal/readers/${selectedReader.id}/confirm_payment_intent`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${dummy_key}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            payment_intent: `${currentPaymentIntent.id}`,
          }),
        });


      if (!response.ok) {
        addLog('error', 'Step 6.3.2: Error Failed to confirm payment via Terminal Reader 1', JSON.stringify(response));      
        const errorData = await response.json();
        addLog('error', 'Step 6.3.3: Error Failed to confirm payment via Terminal Reader 2', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addLog('success', 'Step 6.3.4: Payment confirmed via Terminal Reader', data);
      addLog('success', `Step 6.3.5: Success Payment completed! Status: ${currentPaymentIntent.status}`);
      addLog('info', `Step 6.3.6: Amount: ${(currentPaymentIntent.amount / 100).toFixed(2)} ${currentPaymentIntent.currency.toUpperCase()}`);

      // Reset for next payment
      setPaymentIntentId('');
      setPaymentMethodCollected(false);
      setSelectedProduct(null);
    }
    catch (error) {
      addLog('error', 'Step 6.3.7: Error Failed to confirm payment via Terminal Reader', JSON.stringify(error));
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Step 6.3.8: Error ${message}`, JSON.stringify(message));
    }

    setIsLoading(prev => ({ ...prev, process: false }));
  };

  // Get log color classes
  const getLogColorClass = (type: 'info' | 'success' | 'error') => {
    switch (type) {
      case 'info':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <>
      <Head>
        <title>Stripe Terminal Integration</title>
        <meta name="description" content="Stripe Terminal payment confirmation demo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Stripe Terminal Integration
            </h1>
            <p className="text-gray-600">
              Connect to Stripe Terminal readers and process payments
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Controls */}
            <div className="space-y-6">
              {/* Step 1: Initialize */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">1</span>
                  Initialize Terminal
                </h2>
                <div className="space-y-4">
                  <button
                    onClick={handleInitialize}
                    disabled={!sdkLoaded || !!terminal || isLoading.initialize}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200 shadow-sm hover:shadow-md"
                  >
                    {isLoading.initialize ? 'Initializing...' : terminal ? 'Terminal Initialized ✓' : 'Initialize Terminal'}
                  </button>
                  {!sdkLoaded && (
                    <p className="text-sm text-gray-500 italic">Loading Stripe Terminal SDK...</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Connect to Stripe Terminal using secure server-side APIs
                  </p>
                </div>
              </div>

              {/* Step 2: Discover Readers */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">2</span>
                  Discover Readers
                </h2>
                <button
                  onClick={handleDiscoverReaders}
                  disabled={!terminal || isLoading.discover}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200 shadow-sm hover:shadow-md"
                >
                  {isLoading.discover ? 'Discovering...' : 'Discover Readers'}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Searches for available card readers on the network
                </p>
              </div>

              {/* Step 3: Select and Connect */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">3</span>
                  Select & Connect
                </h2>
                
                {readers.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {readers.map((reader) => (
                      <div
                        key={reader.id}
                        onClick={() => !connectedReader && setSelectedReader(reader)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition duration-200 ${
                          selectedReader?.id === reader.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                        } ${connectedReader ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {reader.label || reader.id}
                            </p>
                            <p className="text-sm text-gray-600">
                              {reader.device_type} • Status: {reader.status}
                            </p>
                            {reader.ip_address && (
                              <p className="text-xs text-gray-500 mt-1">
                                IP: {reader.ip_address}
                              </p>
                            )}
                          </div>
                          {selectedReader?.id === reader.id && (
                            <div className="text-blue-500">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm mb-4">
                    No readers discovered yet. Click "Discover Readers" to search.
                  </p>
                )}

                <button
                  onClick={handleConnectReader}
                  disabled={!terminal || !selectedReader || !!connectedReader || isLoading.connect}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200 shadow-sm hover:shadow-md"
                >
                  {isLoading.connect ? 'Connecting...' : connectedReader ? `Connected to ${connectedReader.label || connectedReader.id}` : 'Connect to Reader'}
                </button>
              </div>

              {/* Step 4: Products */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">4</span>
                  Select Product
                </h2>
                
                <button
                  onClick={handleFetchProducts}
                  disabled={isLoading.products || !connectedReader}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200 shadow-sm hover:shadow-md mb-4"
                >
                  {isLoading.products ? 'Loading Products...' : 'Load Products'}
                </button>

                {products.length > 0 && (
                  <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition duration-200 ${
                          selectedProduct?.id === product.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{product.name}</p>
                            {product.description && (
                              <p className="text-xs text-gray-600">{product.description}</p>
                            )}
                          </div>
                          {product.price && (
                            <div className="text-right ml-3">
                              <p className="font-semibold text-gray-900">
                                {(product.price.amount / 100).toFixed(2)} {product.price.currency.toUpperCase()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleCreatePaymentIntent}
                  disabled={!selectedProduct || isLoading.payment}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200 shadow-sm hover:shadow-md"
                >
                  {isLoading.payment ? 'Creating...' : 'Create Payment Intent'}
                </button>
                
                <p className="text-sm text-gray-500 mt-2">
                  Select a product to create a payment intent
                </p>
              </div>

              {/* Step 5: Process Payment on Terminal */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">5</span>
                  Process Payment on Terminal
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="paymentIntentId" className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Intent ID
                    </label>
                    <input
                      id="paymentIntentId"
                      type="text"
                      value={paymentIntentId}
                      onChange={(e) => {
                        setPaymentIntentId(e.target.value);
                        setPaymentMethodCollected(false);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="pi_xxxxxxxxxxxxx"
                      disabled={!connectedReader || !paymentIntentId.trim()} 
                      /*
                      disabled={!connectedReader || isLoading.collect || paymentMethodCollected} 
                      */ 
                    />
                  </div>
                  <button
                    onClick={handleProcessPayment}
                    disabled={!connectedReader || !paymentIntentId.trim()}
                    /*
                      disabled={!connectedReader || !paymentIntentId.trim() || isLoading.collect || paymentMethodCollected} 
                      */ 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200 shadow-sm hover:shadow-md"
                  >
                    Process Payment on Terminal
                  </button>
                  <p className="text-sm text-gray-500">
                    This will prompt the user to tap/insert card on the reader
                  </p>
                </div>
              </div>

              {/* Step 6: Confirm Payment */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">6</span>
                  Confirm Payment
                </h2>
                <div className="space-y-4">
                  <button
                    onClick={handleConfirmPayment}
                    disabled={!connectedReader || !paymentIntentId.trim()}
                    /* disabled={!paymentMethodCollected || isLoading.process}*/
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200 shadow-sm hover:shadow-md"
                  >
                    {isLoading.process ? 'Confirming Payment...' : 'Confirm & Complete Payment'}
                  </button>
                  <p className="text-sm text-gray-500">
                    Complete the payment transaction via Stripe Terminal SDK
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Logs */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Activity Log</h2>
                  {logs.length > 0 && (
                    <button
                      onClick={() => setLogs([])}
                      className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 h-[600px] overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="text-gray-400 italic text-sm">No activity yet. Start by initializing the terminal.</p>
                  ) : (
                    <div className="space-y-2 font-mono text-sm">
                      {logs.map((log, index) => (
                        <div key={index} className="break-words">
                          <span className="text-gray-400">[{log.timestamp}]</span>
                          <span className={`ml-2 ${getLogColorClass(log.type)}`}>
                            {log.type.toUpperCase()}:
                          </span>
                          <span className="ml-2 text-gray-100">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Connection Status */}
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">SDK Loaded:</span>
                    <span className={`font-medium ${sdkLoaded ? 'text-green-600' : 'text-gray-400'}`}>
                      {sdkLoaded ? '✓ Yes' : '○ No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Terminal:</span>
                    <span className={`font-medium ${terminal ? 'text-green-600' : 'text-gray-400'}`}>
                      {terminal ? '✓ Initialized' : '○ Not Initialized'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Readers Found:</span>
                    <span className="font-medium text-gray-900">{readers.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Connected:</span>
                    <span className={`font-medium ${connectedReader ? 'text-green-600' : 'text-gray-400'}`}>
                      {connectedReader ? `✓ ${connectedReader.label || connectedReader.id}` : '○ No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StripeTerminalPage;

