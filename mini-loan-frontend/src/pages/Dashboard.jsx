import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {CURRENCY_SIGN} from "./constant"

export default function Dashboard() {
  const [loanSummary, setLoanSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchLoanSummary();
  }, []);

  const fetchLoanSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/loans/summary');
      setLoanSummary(response.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 404) {
        setLoanSummary(null);
      } else {
        setError('Failed to fetch loan summary');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaymentError('');
    setSuccessMessage('');

    if (!paymentAmount || Number(paymentAmount) <= 0) {
      setPaymentError('Please enter a valid payment amount');
      return;
    }

    if (Number(paymentAmount) > loanSummary.remainingAmount) {
      setPaymentError('Payment amount cannot exceed remaining loan amount');
      return;
    }

    try {
      setPaymentLoading(true);
      await api.post('/api/payments/pay', {
        loanId: loanSummary.loanId,
        amount: Number(paymentAmount)
      });

      setSuccessMessage('Payment successful!');
      setPaymentAmount('');
      // Refresh loan summary
      await fetchLoanSummary();
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="container">
        <div className="error-card">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchLoanSummary} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!loanSummary) {
    return (
      <div className="container">
        <div className="welcome-section">
          <div className="welcome-card">
            <div className="welcome-icon">🏦</div>
            <h2>Welcome to Mini Loan System</h2>
            <p>You don't have any active loans yet. Get started by creating your first loan!</p>
            <Link to="/create" className="btn btn-primary btn-large">
              Create Your First Loan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <h2>Loan Dashboard</h2>
        <p>Manage your loan and track payments</p>
      </div>

      <div className="dashboard-grid">
        {/* Loan Summary Card */}
        <div className="summary-card">
          <div className="card-header">
            <h3>Loan Summary</h3>
            <span className="loan-id">ID: #{loanSummary.loanId}</span>
          </div>
          
          <div className="summary-grid">
            <div className="summary-item">
              <label>Principal Amount</label>
              <span className="amount">{CURRENCY_SIGN}{loanSummary.principal?.toLocaleString()}</span>
            </div>
            
            <div className="summary-item">
              <label>Interest Rate</label>
              <span className="rate">{loanSummary.interestRate}% p.a.</span>
            </div>
            
            <div className="summary-item">
              <label>Tenure</label>
              <span className="tenure">{loanSummary.tenureMonths} months</span>
            </div>
            
            <div className="summary-item">
              <label>Total Interest</label>
              <span className="amount">{CURRENCY_SIGN}{loanSummary.interestAmount?.toLocaleString()}</span>
            </div>
            
            <div className="summary-item">
              <label>Total Amount</label>
              <span className="amount total">{CURRENCY_SIGN}{loanSummary.totalAmount?.toLocaleString()}</span>
            </div>
            
            <div className="summary-item">
              <label>Monthly EMI</label>
              <span className="amount emi">{CURRENCY_SIGN}{loanSummary.emiAmount?.toLocaleString()}</span>
            </div>

            <div className="summary-item">
              <label>Next Due Date</label>
              <span className="date">{formatDate(loanSummary.nextDueDate)}</span>
            </div>
            
            <div className="summary-item">
              <label>Remaining EMIs</label>
              <span className="count">{loanSummary.remainingEmis}</span>
            </div>
          </div>

          <div className="remaining-section">
            <div className="remaining-amount">
              <label>Remaining Amount</label>
              <span className="amount remaining">₹{loanSummary.remainingAmount?.toLocaleString()}</span>
            </div>
            
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{
                  width: `${((loanSummary.totalAmount - loanSummary.remainingAmount) / loanSummary.totalAmount) * 100}%`
                }}
              ></div>
            </div>
            
            <div className="progress-text">
              {Math.round(((loanSummary.totalAmount - loanSummary.remainingAmount) / loanSummary.totalAmount) * 100)}% Paid
            </div>
          </div>
        </div>

        {/* Payment Card */}
        <div className="payment-card">
          <div className="card-header">
            <h3>Make Payment</h3>
            <p>Pay your EMI or make additional payments</p>
          </div>

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          <form onSubmit={handlePayment} className="payment-form">
            <div className="form-group">
              <label htmlFor="paymentAmount">Payment Amount (₹)</label>
              <input
                type="number"
                id="paymentAmount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount to pay"
                min="1"
                max={loanSummary.remainingAmount}
                step="0.01"
                required
              />
            </div>

            {paymentError && (
              <div className="error-message">
                {paymentError}
              </div>
            )}

            <div className="payment-suggestions">
              <p>Quick amounts:</p>
              <div className="quick-amounts">
                <button
                  type="button"
                  className="btn btn-small"
                  onClick={() => setPaymentAmount(loanSummary.emiAmount.toString())}
                >
                  EMI (₹{loanSummary.emiAmount?.toLocaleString()})
                </button>
                <button
                  type="button"
                  className="btn btn-small"
                  onClick={() => setPaymentAmount(loanSummary.remainingAmount.toString())}
                >
                  Full Amount
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={paymentLoading || !paymentAmount}
            >
              {paymentLoading ? 'Processing...' : 'Make Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}