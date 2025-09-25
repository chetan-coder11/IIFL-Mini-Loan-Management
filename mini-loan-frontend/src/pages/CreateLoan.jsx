import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CreateLoan() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    principal: '',
    interestRate: '',
    tenureMonths: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculations, setCalculations] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error and recalculate
    if (error) setError('');
    calculateLoan({ ...formData, [name]: value });
  };

  const calculateLoan = (data) => {
    const { principal, interestRate, tenureMonths } = data;
    
    if (principal && interestRate && tenureMonths) {
      const p = Number(principal);
      const r = Number(interestRate);
      const t = Number(tenureMonths);
      
      if (p > 0 && r >= 0 && t > 0) {
        const interest = (p * r * (t / 12)) / 100;
        const total = p + interest;
        const emi = total / t;
        
        setCalculations({
          interest: Math.round(interest),
          total: Math.round(total),
          emi: Math.round(emi)
        });
      } else {
        setCalculations(null);
      }
    } else {
      setCalculations(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.principal || !formData.interestRate || !formData.tenureMonths) {
      setError('Please fill in all fields');
      return;
    }

    const principal = Number(formData.principal);
    const interestRate = Number(formData.interestRate);
    const tenureMonths = Number(formData.tenureMonths);

    if (principal <= 0) {
      setError('Principal amount must be greater than 0');
      return;
    }

    if (interestRate < 0) {
      setError('Interest rate cannot be negative');
      return;
    }

    if (tenureMonths <= 0 || tenureMonths > 360) {
      setError('Tenure must be between 1 and 360 months');
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/loans/create', {
        principal,
        interestRate,
        tenureMonths
      });

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create loan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container">
      <div className="create-loan-container">
        <div className="form-section">
          <div className="card">
            <div className="card-header">
              <h2>Create New Loan</h2>
              <p>Fill in the details below to apply for a loan</p>
            </div>

            <form onSubmit={handleSubmit} className="loan-form">
              <div className="form-group">
                <label htmlFor="principal">Principal Amount (₹)</label>
                <input
                  type="number"
                  id="principal"
                  name="principal"
                  value={formData.principal}
                  onChange={handleChange}
                  placeholder="Enter loan amount"
                  min="1000"
                  step="1000"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="interestRate">Interest Rate (% per annum)</label>
                <input
                  type="number"
                  id="interestRate"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleChange}
                  placeholder="Enter interest rate"
                  min="0"
                  max="50"
                  step="0.1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="tenureMonths">Tenure (Months)</label>
                <input
                  type="number"
                  id="tenureMonths"
                  name="tenureMonths"
                  value={formData.tenureMonths}
                  onChange={handleChange}
                  placeholder="Enter tenure in months"
                  min="1"
                  max="360"
                  required
                />
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Creating Loan...' : 'Create Loan'}
              </button>
            </form>
          </div>
        </div>

        {/* Calculations Preview */}
        {calculations && (
          <div className="calculations-section">
            <div className="card calculations-card">
              <div className="card-header">
                <h3>Loan Calculations</h3>
                <p>Preview of your loan details</p>
              </div>

              <div className="calc-grid">
                <div className="calc-item">
                  <label>Principal</label>
                  <span className="calc-value">₹{Number(formData.principal).toLocaleString()}</span>
                </div>
                
                <div className="calc-item">
                  <label>Interest Amount</label>
                  <span className="calc-value">₹{calculations.interest.toLocaleString()}</span>
                </div>
                
                <div className="calc-item highlight">
                  <label>Total Payable</label>
                  <span className="calc-value">₹{calculations.total.toLocaleString()}</span>
                </div>
                
                <div className="calc-item highlight">
                  <label>Monthly EMI</label>
                  <span className="calc-value">₹{calculations.emi.toLocaleString()}</span>
                </div>
              </div>

              <div className="calc-note">
                <p><strong>Note:</strong> This is calculated using simple interest formula.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}