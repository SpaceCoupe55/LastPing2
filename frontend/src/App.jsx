import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from 'declarations/backend';
import { canisterId } from 'declarations/backend/index.js';
import { Principal } from '@dfinity/principal';
import { 
  Shield, 
  Clock, 
  Wallet, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Settings,
  ArrowRight,
  Zap,
  Lock,
  Timer,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react';

const network = process.env.DFX_NETWORK;
const identityProvider =
  network === 'ic'
    ? 'https://identity.ic0.app' // Mainnet
    : 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943'; // Local

// Utility functions
const formatTokenAmount = (amount) => {
  return (Number(amount) / 100000000).toFixed(2);
};

const formatTime = (timestamp) => {
  return new Date(Number(timestamp) / 1000000).toLocaleString();
};

const formatTimeout = (timeoutNs) => {
  const days = Math.floor(Number(timeoutNs) / (24 * 60 * 60 * 1000000000));
  return `${days} days`;
};

// Enhanced reusable components
const Button = ({ onClick, children, disabled = false, variant = 'primary', size = 'md', icon: Icon, className = '' }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105 active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-lg hover:shadow-xl",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500 shadow-md hover:shadow-lg",
    danger: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-lg hover:shadow-xl",
    success: "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500 shadow-lg hover:shadow-xl",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-xl"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

const Card = ({ title, children, className = "", icon: Icon, gradient = false }) => (
  <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden ${gradient ? 'bg-gradient-to-br from-white to-gray-50' : ''} ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center">
          {Icon && <Icon className="w-5 h-5 mr-3 text-blue-600" />}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

const InfoBox = ({ type = 'info', children, className = "" }) => {
  const types = {
    info: 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-800',
    success: 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-800',
    warning: 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-800',
    error: 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-800'
  };
  
  const icons = {
    info: CheckCircle,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertTriangle
  };
  
  const IconComponent = icons[type];
  
  return (
    <div className={`border rounded-xl p-4 ${types[type]} ${className} animate-in slide-in-from-top-2 duration-300`}>
      <div className="flex items-start">
        <IconComponent className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
    </div>
  </div>
);

const StatusBadge = ({ status, expired }) => (
  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
    expired 
      ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300' 
      : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
  }`}>
    <div className={`w-2 h-2 rounded-full mr-2 ${expired ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
    {expired ? 'Timeout Expired' : 'Active'}
  </div>
);

const StatCard = ({ icon: Icon, label, value, color = "blue" }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
    <div className="flex items-center">
      <div className={`p-2 rounded-lg bg-${color}-100 mr-3`}>
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const App = () => {
  const [state, setState] = useState({
    actor: undefined,
    authClient: undefined,
    isAuthenticated: false,
    principal: null,
    loading: false,
    error: null,
    success: null
  });

  const [userStatus, setUserStatus] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [backupWallet, setBackupWallet] = useState('');
  const [timeout, setTimeout] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [claimOwner, setClaimOwner] = useState('');

  // Initialize auth client
  useEffect(() => {
    updateActor();
  }, []);

  const updateActor = async () => {
    try {
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      const actor = createActor(canisterId, {
        agentOptions: {
          identity
        }
      });
      const isAuthenticated = await authClient.isAuthenticated();
      const principal = isAuthenticated ? identity.getPrincipal().toString() : null;

      setState(prev => ({
        ...prev,
        actor,
        authClient,
        isAuthenticated,
        principal
      }));

      if (isAuthenticated) {
        await loadUserData(actor);
        await loadTokenInfo(actor);
      }
    } catch (error) {
      setError('Failed to initialize authentication');
    }
  };

  const loadUserData = async (actor) => {
    try {
      const result = await actor.getMyStatus();
      if ('ok' in result) {
        setUserStatus(result.ok);
      } else {
        setUserStatus(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadTokenInfo = async (actor) => {
    try {
      const [name, symbol, decimals, totalSupply, fee] = await Promise.all([
        actor.icrc1_name(),
        actor.icrc1_symbol(),
        actor.icrc1_decimals(),
        actor.icrc1_total_supply(),
        actor.icrc1_fee()
      ]);

      setTokenInfo({
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply,
        fee
      });
    } catch (error) {
      console.error('Error loading token info:', error);
    }
  };

  const setError = (message) => {
    setState(prev => ({ ...prev, error: message, success: null }));
  };

  const setSuccess = (message) => {
    setState(prev => ({ ...prev, success: message, error: null }));
  };

  const login = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      await state.authClient.login({
        identityProvider,
        onSuccess: updateActor
      });
    } catch (error) {
      setError('Login failed');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const logout = async () => {
    await state.authClient.logout();
    setUserStatus(null);
    setTokenInfo(null);
    updateActor();
  };

  const initializeUser = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const result = await state.actor.initializeUser();
      if ('ok' in result) {
        setSuccess(result.ok);
        await loadUserData(state.actor);
      } else {
        setError(result.err);
      }
    } catch (error) {
      setError('Failed to initialize user');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handlePing = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const result = await state.actor.ping();
      if ('ok' in result) {
        setSuccess(result.ok);
        await loadUserData(state.actor);
      } else {
        setError(result.err);
      }
    } catch (error) {
      setError('Ping failed');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSetBackup = async () => {
  if (!backupWallet.trim()) {
    setError('Please enter a backup wallet address');
    return;
  }

  // Validate Principal format
  let backupPrincipal;
  try {
    backupPrincipal = Principal.fromText(backupWallet.trim());
  } catch (error) {
    setError('Invalid backup wallet address format. Please enter a valid Principal ID.');
    return;
  }

  setState(prev => ({ ...prev, loading: true }));
  try {
    const result = await state.actor.setBackup(backupPrincipal);
    if ('ok' in result) {
      setSuccess(result.ok);
      setBackupWallet('');
      await loadUserData(state.actor);
    } else {
      setError(result.err);
    }
  } catch (error) {
    console.error('Set backup error:', error);
    setError('Failed to set backup wallet: ' + error.message);
  } finally {
    setState(prev => ({ ...prev, loading: false }));
  }
};

  const handleSetTimeout = async () => {
    const timeoutDays = parseInt(timeout);
    if (isNaN(timeoutDays) || timeoutDays <= 0) {
      setError('Please enter a valid number of days');
      return;
    }

    const timeoutNs = timeoutDays * 24 * 60 * 60 * 1000000000;
    setState(prev => ({ ...prev, loading: true }));
    try {
      const result = await state.actor.setTimeout(timeoutNs);
      if ('ok' in result) {
        setSuccess(result.ok);
        setTimeout('');
        await loadUserData(state.actor);
      } else {
        setError(result.err);
      }
    } catch (error) {
      setError('Failed to set timeout');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleTransfer = async () => {
  if (!transferTo.trim() || !transferAmount.trim()) {
    setError('Please enter both recipient and amount');
    return;
  }

  const amount = parseFloat(transferAmount);
  if (isNaN(amount) || amount <= 0) {
    setError('Please enter a valid amount');
    return;
  }

  // Validate and convert the recipient address to Principal
  let recipientPrincipal;
  try {
    recipientPrincipal = Principal.fromText(transferTo.trim());
  } catch (error) {
    setError('Invalid recipient address format. Please enter a valid Principal ID.');
    return;
  }

  const amountNat = Math.floor(amount * 100000000);
  setState(prev => ({ ...prev, loading: true }));
  
  try {
    const result = await state.actor.icrc1_transfer({
      to: { owner: recipientPrincipal, subaccount: [] }, // ← Now using Principal object
      amount: amountNat,
      fee: [tokenInfo.fee],
      memo: [],
      from_subaccount: [],
      created_at_time: []
    });

    if ('Ok' in result) {
      setSuccess(`Transfer successful! Transaction ID: ${result.Ok}`);
      setTransferTo('');
      setTransferAmount('');
      await loadUserData(state.actor);
    } else {
      setError(`Transfer failed: ${JSON.stringify(result.Err)}`);
    }
  } catch (error) {
    console.error('Transfer error:', error);
    setError('Transfer failed: ' + error.message);
  } finally {
    setState(prev => ({ ...prev, loading: false }));
  }
};

   const handleClaim = async () => {
  if (!claimOwner.trim()) {
    setError('Please enter the original owner address');
    return;
  }

  // Validate Principal format (same as handleSetBackup)
  let originalOwnerPrincipal;
  try {
    originalOwnerPrincipal = Principal.fromText(claimOwner.trim());
  } catch (error) {
    setError('Invalid original owner address format. Please enter a valid Principal ID.');
    return;
  }

  setState(prev => ({ ...prev, loading: true }));
  try {
    const result = await state.actor.claim(originalOwnerPrincipal);
    if ('ok' in result) {
      setSuccess(result.ok);
      setClaimOwner('');
      await loadUserData(state.actor);
    } else {
      setError(result.err);
    }
  } catch (error) {
    console.error('Claim error:', error);
    setError('Claim failed: ' + error.message);
  } finally {
    setState(prev => ({ ...prev, loading: false }));
  }
};

  const isTimeoutExpired = () => {
    if (!userStatus) return false;
    const now = Date.now() * 1000000; // Convert to nanoseconds
    return now > (Number(userStatus.lastPing) + Number(userStatus.timeout));
  };

  const copyToClipboard = async (text) => {
    if (!text) {
      setError('No text to copy');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Copied to clipboard!');
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        setSuccess('Copied to clipboard!');
      } catch (fallbackError) {
        setError('Failed to copy to clipboard');
      }
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 font-medium">Loading LastPing Factory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mr-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    LastPing Factory
                  </h1>
                  <p className="text-xs text-gray-500">Digital Asset Inheritance</p>
                </div>
              </div>
            </div>
            
            {state.isAuthenticated && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Connected</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-500 font-mono">
                      {state.principal?.slice(0, 8)}...{state.principal?.slice(-8)}
                    </p>
                    <Button 
                      onClick={() => copyToClipboard(state.principal)} 
                      variant="ghost" 
                      size="sm"
                      icon={Copy}
                      className="!p-1 !min-w-0"
                    >
                    </Button>
                  </div>
                </div>
                <Button onClick={logout} variant="ghost" size="sm" icon={ExternalLink}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Error/Success Messages */}
        {state.error && (
          <InfoBox type="error" className="mb-6">
            {state.error}
          </InfoBox>
        )}
        {state.success && (
          <InfoBox type="success" className="mb-6">
            {state.success}
          </InfoBox>
        )}

        {/* Authentication */}
        {!state.isAuthenticated ? (
          <div className="max-w-md mx-auto">
            <Card className="text-center" gradient>
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to LastPing</h2>
                <p className="text-gray-600">
                  Secure your digital assets with automated inheritance protection
                </p>
              </div>
              <Button onClick={login} size="lg" icon={User} className="w-full">
                Connect with Internet Identity
              </Button>
            </Card>
          </div>
        ) : (
          <>
            {/* Token Information */}
            {tokenInfo && (
              <Card title="Token Information" icon={Zap} className="mb-6" gradient>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={Zap} label="Token Name" value={tokenInfo.name} color="blue" />
                  <StatCard icon={Wallet} label="Symbol" value={tokenInfo.symbol} color="green" />
                  <StatCard icon={RefreshCw} label="Total Supply" value={`${formatTokenAmount(tokenInfo.totalSupply)} ${tokenInfo.symbol}`} color="purple" />
                  <StatCard icon={Send} label="Transfer Fee" value={`${formatTokenAmount(tokenInfo.fee)} ${tokenInfo.symbol}`} color="orange" />
                </div>
              </Card>
            )}

            {/* User Status */}
            {userStatus ? (
              <div className="space-y-6">
                {/* Status Overview */}
                <Card title="Account Overview" icon={User} gradient>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Token Balance</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {formatTokenAmount(userStatus.tokenBalance)}
                          </p>
                          <p className="text-sm text-blue-600">{tokenInfo?.symbol}</p>
                        </div>
                        <Wallet className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-medium">Last Ping</p>
                          <p className="text-sm font-semibold text-green-900">
                            {formatTime(userStatus.lastPing)}
                          </p>
                        </div>
                        <Clock className="w-8 h-8 text-green-600" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Timeout Period</p>
                          <p className="text-lg font-bold text-purple-900">
                            {formatTimeout(userStatus.timeout)}
                          </p>
                        </div>
                        <Timer className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-orange-600 font-medium">Status</p>
                          <StatusBadge expired={isTimeoutExpired()} />
                        </div>
                        <Shield className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>

                   <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-white rounded-lg mr-3 shadow-sm">
                        <Wallet className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Backup Wallet</p>
                        <p className="font-mono text-sm text-gray-900">
                          {userStatus.backupWallet ? userStatus.backupWallet.toString() : 'Not configured'}
                        </p>
                      </div>
                    </div>
                    {userStatus.backupWallet && (
                      <Button 
                        onClick={() => copyToClipboard(userStatus.backupWallet.toString())} 
                        variant="ghost" 
                        size="sm"
                        icon={Copy}
                      >
                        Copy
                      </Button>
                    )}
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Button onClick={handlePing} variant="success" size="lg" icon={Zap}>
                      Send Ping (+10 LPT)
                    </Button>
                  </div>
                </Card>

                {/* Management Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Account Management */}
                  <Card title="Account Settings" icon={Settings}>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Backup Wallet Address
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={backupWallet}
                            onChange={(e) => setBackupWallet(e.target.value)}
                            placeholder="Enter backup wallet address"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                          <Button onClick={handleSetBackup} disabled={!backupWallet.trim()} icon={Shield}>
                            Set
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timeout Period (days)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={timeout}
                            onChange={(e) => setTimeout(e.target.value)}
                            placeholder="Enter days"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                          <Button onClick={handleSetTimeout} disabled={!timeout.trim()} icon={Timer}>
                            Set
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Claim Ownership
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={claimOwner}
                            onChange={(e) => setClaimOwner(e.target.value)}
                            placeholder="Enter original owner address"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                          />
                          <Button onClick={handleClaim} disabled={!claimOwner.trim()} variant="danger" icon={Lock}>
                            Claim
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Token Transfer */}
                  <Card title="Transfer Tokens" icon={Send}>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recipient Address
                        </label>
                        <input
                          type="text"
                          value={transferTo}
                          onChange={(e) => setTransferTo(e.target.value)}
                          placeholder="Enter recipient address"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount ({tokenInfo?.symbol})
                        </label>
                        <input
                          type="number"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          placeholder="Enter amount"
                          step="0.01"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center text-sm text-gray-600">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Transfer fee: {tokenInfo ? formatTokenAmount(tokenInfo.fee) : '0'} {tokenInfo?.symbol}
                        </div>
                      </div>

                      <Button 
                        onClick={handleTransfer} 
                        disabled={!transferTo.trim() || !transferAmount.trim()}
                        className="w-full"
                        size="lg"
                        icon={ArrowRight}
                      >
                        Send Transfer
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <Card title="Initialize Your Account" icon={User} className="max-w-2xl mx-auto" gradient>
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Started with LastPing</h3>
                  <p className="text-gray-600 mb-6">
                    Create your LastPing account to start earning tokens and secure your digital assets with automated inheritance protection.
                  </p>
                  <Button onClick={initializeUser} variant="success" size="lg" icon={Zap}>
                    Initialize Account (+1000 LPT)
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;