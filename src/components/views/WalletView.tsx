import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, ArrowDownLeft, ArrowUpRight, History, Copy, QrCode, DollarSign, Coins, ShieldCheck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RewardCurrency } from '../../types';

export const WalletView: React.FC = () => {
  const { wallet, settings, transactions, requestWithdraw, requestDeposit, copyToClipboard } = useApp();
  const [activeModal, setActiveModal] = useState<'none' | 'deposit' | 'withdraw'>('none');

  // Withdraw State
  const [wdCurrency, setWdCurrency] = useState<RewardCurrency>('USDT');
  const [wdAmount, setWdAmount] = useState<string>('10');
  const [wdAddress, setWdAddress] = useState<string>('');
  const [wdNetwork, setWdNetwork] = useState<string>('TRC20');

  // Deposit State
  const [depCurrency, setDepCurrency] = useState<RewardCurrency>('TON');
  const [depAmount, setDepAmount] = useState<string>('2.0');
  const [depTxHash, setDepTxHash] = useState<string>('');

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(wdAmount);
    if (isNaN(amt) || amt <= 0) return;

    let min = settings.minWithdrawUsdt;
    if (wdCurrency === 'TON') min = settings.minWithdrawTon;
    if (wdCurrency === 'APP Token') min = settings.minWithdrawToken;

    if (amt < min) {
      alert(`Minimum withdrawal for ${wdCurrency} is ${min}`);
      return;
    }
    if (!wdAddress.trim()) {
      alert('Please enter your recipient wallet address.');
      return;
    }

    requestWithdraw(amt, wdCurrency, wdAddress, wdNetwork);
    setActiveModal('none');
    setWdAddress('');
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depAmount);
    if (isNaN(amt) || amt <= 0) return;
    if (!depTxHash.trim()) {
      alert('Please enter the transaction hash / TXID for verification.');
      return;
    }

    requestDeposit(amt, depCurrency, depTxHash);
    setActiveModal('none');
    setDepTxHash('');
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Total Assets Header Card */}
      <div className="bg-white rounded-3xl border-3 border-black p-5 shadow-[6px_6px_0px_0px_#000] relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-[#FFDE59] rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <Wallet className="w-6 h-6 text-black" />
            </div>
            <div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Universal Wallet</span>
              <h2 className="text-xl font-black text-black">Crypto Assets</h2>
            </div>
          </div>
          <span className="text-xs font-black px-2.5 py-1 bg-green-100 border-2 border-black rounded-xl text-green-800">
            ● Secure
          </span>
        </div>

        {/* Currency Grid */}
        <div className="grid grid-cols-3 gap-2.5 mt-5">
          <div className="p-3 bg-[#E0F7FA] rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] text-center">
            <span className="text-[10px] font-black text-teal-800 uppercase">$TONQ Token</span>
            <p className="text-base font-black text-black mt-1 truncate">{wallet.appToken.toLocaleString()}</p>
          </div>

          <div className="p-3 bg-[#FFF9C4] rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] text-center">
            <span className="text-[10px] font-black text-yellow-900 uppercase">USDT (Tether)</span>
            <p className="text-base font-black text-black mt-1">${wallet.usdt.toFixed(2)}</p>
          </div>

          <div className="p-3 bg-[#E3F2FD] rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000] text-center">
            <span className="text-[10px] font-black text-blue-900 uppercase">TON Coin</span>
            <p className="text-base font-black text-black mt-1">{wallet.ton.toFixed(2)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={() => setActiveModal('deposit')}
            className="py-3 px-4 bg-[#7ED957] hover:bg-[#6cca46] text-black font-black text-sm uppercase rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowDownLeft className="w-5 h-5 stroke-[3px]" />
            <span>Deposit</span>
          </button>

          <button
            onClick={() => setActiveModal('withdraw')}
            className="py-3 px-4 bg-[#FF914D] hover:bg-[#eb803d] text-black font-black text-sm uppercase rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowUpRight className="w-5 h-5 stroke-[3px]" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Transaction History Logs */}
      <div className="bg-white rounded-3xl border-3 border-black p-4 shadow-[6px_6px_0px_0px_#000]">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-5 h-5 text-purple-600" />
          <h3 className="text-base font-black uppercase text-black">Recent Transactions</h3>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {transactions.length === 0 ? (
            <p className="text-xs font-bold text-gray-500 text-center py-6">No transaction records found.</p>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 bg-gray-50 rounded-2xl border-2 border-black flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl border border-black font-black uppercase text-[10px] ${
                      tx.type === 'deposit'
                        ? 'bg-green-200 text-green-900'
                        : tx.type === 'withdraw'
                        ? 'bg-orange-200 text-orange-900'
                        : 'bg-yellow-200 text-yellow-900'
                    }`}
                  >
                    {tx.type.substring(0, 3)}
                  </div>
                  <div>
                    <p className="font-black text-black">{tx.note || tx.type}</p>
                    <span className="text-[10px] text-gray-500">{tx.createdAt}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-black ${tx.type === 'withdraw' ? 'text-red-600' : 'text-green-600'}`}>
                    {tx.type === 'withdraw' ? '-' : '+'}{tx.amount} {tx.currency}
                  </p>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                      tx.status === 'approved' || tx.status === 'completed'
                        ? 'bg-green-100 border-green-600 text-green-800'
                        : tx.status === 'rejected'
                        ? 'bg-red-100 border-red-600 text-red-800'
                        : 'bg-yellow-100 border-yellow-600 text-yellow-800 animate-pulse'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {activeModal === 'deposit' && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border-3 border-black p-5 shadow-[8px_8px_0px_0px_#000] w-full max-w-sm max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <h3 className="text-lg font-black uppercase text-black flex items-center gap-2">
                  <ArrowDownLeft className="w-5 h-5 text-green-600" />
                  <span>Deposit Funds</span>
                </h3>
                <button onClick={() => setActiveModal('none')} className="font-black text-xl px-2 hover:text-red-600">✕</button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-gray-700">Select Asset</label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {(['TON', 'USDT'] as const).map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => setDepCurrency(curr)}
                        className={`py-2 px-3 rounded-xl border-2 border-black font-black text-xs ${
                          depCurrency === curr ? 'bg-[#FFDE59] shadow-[2px_2px_0px_0px_#000]' : 'bg-gray-100'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generated Wallet Address Display */}
                <div className="p-3 bg-blue-50 rounded-2xl border-2 border-black">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-blue-900">Official Deposit Wallet</span>
                    <QrCode className="w-4 h-4 text-blue-700" />
                  </div>
                  <p className="font-mono text-xs font-bold text-black break-all mt-1 bg-white p-2 rounded border border-black">
                    {depCurrency === 'TON' ? settings.depositWalletAddressTon : settings.depositWalletAddressUsdt}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(depCurrency === 'TON' ? settings.depositWalletAddressTon : settings.depositWalletAddressUsdt, 'Wallet Address')}
                    className="mt-2 w-full py-1.5 bg-white hover:bg-yellow-100 border-2 border-black rounded-xl font-black text-xs shadow-[2px_2px_0px_0px_#000] flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Deposit Address</span>
                  </button>
                </div>

                {/* Report Form */}
                <form onSubmit={handleDepositSubmit} className="space-y-3 pt-2 border-t border-gray-200">
                  <div>
                    <label className="text-xs font-black uppercase text-gray-700">Amount Sent ({depCurrency})</label>
                    <input
                      type="number"
                      step="any"
                      value={depAmount}
                      onChange={(e) => setDepAmount(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-xl border-2 border-black font-black text-sm bg-gray-50 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-gray-700">Transaction Hash / TXID</label>
                    <input
                      type="text"
                      placeholder="e.g. 0xabc... or EQD..."
                      value={depTxHash}
                      onChange={(e) => setDepTxHash(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-xl border-2 border-black font-mono text-xs bg-gray-50 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#7ED957] hover:bg-[#6cca46] text-black font-black text-sm uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    Submit Deposit Verification
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Withdraw Modal */}
        {activeModal === 'withdraw' && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border-3 border-black p-5 shadow-[8px_8px_0px_0px_#000] w-full max-w-sm max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <h3 className="text-lg font-black uppercase text-black flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-orange-600" />
                  <span>Request Withdraw</span>
                </h3>
                <button onClick={() => setActiveModal('none')} className="font-black text-xl px-2 hover:text-red-600">✕</button>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-gray-700">Withdraw Currency</label>
                  <div className="grid grid-cols-3 gap-2 mt-1.5">
                    {(['USDT', 'TON', 'APP Token'] as const).map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => setWdCurrency(curr)}
                        className={`py-2 px-1 rounded-xl border-2 border-black font-black text-[11px] truncate ${
                          wdCurrency === curr ? 'bg-[#FF914D] text-black shadow-[2px_2px_0px_0px_#000]' : 'bg-gray-100'
                        }`}
                      >
                        {curr === 'APP Token' ? '$TONQ' : curr}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-700">Network</label>
                  <select
                    value={wdNetwork}
                    onChange={(e) => setWdNetwork(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border-2 border-black font-black text-xs bg-gray-50 focus:outline-none"
                  >
                    <option value="TON">TON Blockchain (Native)</option>
                    <option value="TRC20">TRC20 (Tron Network)</option>
                    <option value="ERC20">ERC20 (Ethereum Network)</option>
                    <option value="BEP20">BEP20 (BNB Chain)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-black">
                    <label className="uppercase text-gray-700">Amount</label>
                    <span className="text-gray-500">
                      Min: {wdCurrency === 'USDT' ? settings.minWithdrawUsdt : wdCurrency === 'TON' ? settings.minWithdrawTon : settings.minWithdrawToken}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={wdAmount}
                    onChange={(e) => setWdAmount(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border-2 border-black font-black text-sm bg-gray-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-700">Recipient Wallet Address</label>
                  <input
                    type="text"
                    placeholder="Enter your wallet address..."
                    value={wdAddress}
                    onChange={(e) => setWdAddress(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border-2 border-black font-mono text-xs bg-gray-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-black text-[11px] font-bold text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Withdrawals require admin security review. Processing takes up to 24 hours.</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#FF914D] hover:bg-[#eb803d] text-black font-black text-sm uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer active:translate-y-0.5 active:shadow-none transition-all"
                >
                  Submit Withdraw Request
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
