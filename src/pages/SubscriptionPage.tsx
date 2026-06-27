import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CURRENT_USER_ID,
  SubscriptionDto,
  getActiveSubscription,
  subscribe,
} from '../api';
import { useAsync } from '../hooks/useAsync';
import { CheckIcon, ChevronRightIcon, CloseIcon, CreditCardIcon } from '../components/Icons';

interface PlanCard {
  code: string;
  name: string;
  priceLabel: string;
  perLabel: string;
  saveLabel?: string;
  highlights: string[];
  recommended?: boolean;
}

/**
 * Two INR plans hardcoded to match the seed (db/seed-inr-plans.sql).
 * Subscribe POSTs to /api/users/{id}/subscribe which looks them up by
 * code, creates a user_subscriptions row, and records a "succeeded"
 * payment row (stubbed — wire to a real gateway later).
 */
const PLANS: PlanCard[] = [
  {
    code: 'premium_monthly_inr',
    name: 'Monthly',
    priceLabel: '₹199',
    perLabel: 'per month',
    highlights: [
      'Full library access',
      'HD audio quality',
      'Offline downloads',
      'Up to 3 devices',
      'Cancel anytime',
    ],
  },
  {
    code: 'premium_annual_inr',
    name: 'Annual',
    priceLabel: '₹1,990',
    perLabel: 'per year',
    saveLabel: 'Save ₹398 · 2 months free',
    highlights: [
      'Everything in Monthly',
      'Pay for 10 months, get 12',
      'Up to 5 devices',
      'Early access to new releases',
      'Priority support',
    ],
    recommended: true,
  },
];

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const subQ = useAsync<SubscriptionDto | null>((s) => getActiveSubscription(CURRENT_USER_ID, s), []);

  const [selectedPlan, setSelectedPlan] = useState<PlanCard | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<SubscriptionDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    setProcessing(true);
    setError(null);
    try {
      // 1.5s simulated payment delay to feel realistic.
      await new Promise((r) => window.setTimeout(r, 1500));
      const next = await subscribe(CURRENT_USER_ID, { planCode: selectedPlan.code });
      setSuccess(next);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Subscription failed';
      setError(msg);
    } finally {
      setProcessing(false);
    }
  };

  // ----- Success state -----
  if (success) {
    return (
      <div className="bs-screen">
        <div className="bs-sub" style={{ paddingTop: 32 }}>
          <div className="bs-sub__success">
            <div className="bs-sub__success-check">
              <CheckIcon size={42} />
            </div>
            <h2>You're a BookSee Premium member</h2>
            <p>
              Your <strong>{success.planName}</strong> subscription is active until{' '}
              {new Date(success.expiresAt).toLocaleDateString()}.
            </p>
            <button
              className="bs-sub__cta"
              onClick={() => navigate('/profile')}
              style={{ marginTop: 14 }}
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPlanCode = subQ.data?.planCode;

  return (
    <div className="bs-screen">
      <div className="bs-sub">
        <div className="bs-sub__header">
          <button
            className="bs-sub__back"
            onClick={() => navigate('/profile')}
            aria-label="Back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div>
            <div className="bs-sub__eyebrow">BookSee Premium</div>
            <h1 className="bs-sub__title">Listen without limits</h1>
            <p className="bs-sub__subtitle">
              Pick a plan, cancel any time. Premium unlocks the full library, HD audio and offline
              downloads.
            </p>
          </div>
        </div>

        <div className="bs-sub__plans">
          {PLANS.map((plan) => {
            const isCurrent = currentPlanCode === plan.code;
            return (
              <div
                key={plan.code}
                className={`bs-sub-plan ${plan.recommended ? 'bs-sub-plan--featured' : ''}`}
              >
                {plan.recommended && <div className="bs-sub-plan__badge">Best value</div>}
                <div className="bs-sub-plan__head">
                  <div>
                    <div className="bs-sub-plan__name">{plan.name}</div>
                    {plan.saveLabel && <div className="bs-sub-plan__save">{plan.saveLabel}</div>}
                  </div>
                  <div className="bs-sub-plan__price">
                    <span className="bs-sub-plan__priceval">{plan.priceLabel}</span>
                    <span className="bs-sub-plan__priceper">{plan.perLabel}</span>
                  </div>
                </div>
                <ul className="bs-sub-plan__list">
                  {plan.highlights.map((h) => (
                    <li key={h}>
                      <CheckIcon size={14} /> {h}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <button className="bs-sub-plan__cta bs-sub-plan__cta--current" disabled>
                    Current plan
                  </button>
                ) : (
                  <button
                    className={`bs-sub-plan__cta ${plan.recommended ? 'bs-sub-plan__cta--primary' : ''}`}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setPaymentOpen(true);
                    }}
                  >
                    Choose {plan.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="bs-sub__terms">
          By subscribing you agree to BookSee.App's Terms &amp; Conditions and Privacy Policy.
          Your subscription auto-renews until you cancel from Profile → Payment &amp; Subscription.
        </p>
      </div>

      {/* Payment sheet */}
      {paymentOpen && selectedPlan && (
        <div className="bs-modal-backdrop" onClick={() => !processing && setPaymentOpen(false)}>
          <div className="bs-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bs-modal__handle" />
            <div className="bs-row" style={{ marginBottom: 8 }}>
              <h2 className="bs-modal__title" style={{ flex: 1, textAlign: 'left' }}>
                Confirm Payment
              </h2>
              {!processing && (
                <button
                  onClick={() => setPaymentOpen(false)}
                  aria-label="Close"
                  style={{ color: 'var(--bs-text-dim)' }}
                >
                  <CloseIcon size={20} />
                </button>
              )}
            </div>

            <div className="bs-glass" style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--bs-text-dim)' }}>BOOKSEE PREMIUM · {selectedPlan.name.toUpperCase()}</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
                {selectedPlan.priceLabel}
                <span style={{ fontSize: 13, color: 'var(--bs-text-dim)', fontWeight: 500, marginLeft: 6 }}>
                  {selectedPlan.perLabel}
                </span>
              </div>
              {selectedPlan.saveLabel && (
                <div style={{ fontSize: 12, color: 'var(--bs-orange)', marginTop: 4 }}>
                  {selectedPlan.saveLabel}
                </div>
              )}
            </div>

            <div className="bs-menu" style={{ marginBottom: 12 }}>
              <div className="bs-menu__group">
                <button className="bs-menu__item">
                  <span className="bs-menu__icon">
                    <CreditCardIcon />
                  </span>
                  <span className="bs-menu__label">Card ending •••• 4242</span>
                  <span className="bs-menu__chevron">
                    <ChevronRightIcon size={18} />
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: 10,
                  borderRadius: 10,
                  background: 'rgba(255,46,63,0.15)',
                  border: '1px solid rgba(255,46,63,0.4)',
                  color: 'var(--bs-white)',
                  fontSize: 12,
                  marginBottom: 10,
                }}
              >
                {error}
              </div>
            )}

            <button
              className="bs-sub-plan__cta bs-sub-plan__cta--primary"
              onClick={handleSubscribe}
              disabled={processing}
              style={{ width: '100%' }}
            >
              {processing ? 'Processing…' : `Pay ${selectedPlan.priceLabel}`}
            </button>

            <p style={{ fontSize: 10, color: 'var(--bs-text-muted)', marginTop: 8, textAlign: 'center' }}>
              Payment is simulated. Wire your real gateway (Razorpay, Stripe) into the
              POST /api/users/{'{'}{'id'}{'}'}/subscribe handler.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
