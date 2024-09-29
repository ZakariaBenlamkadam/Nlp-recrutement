import React from 'react';
import './Pricing.css'

const PricingTier = ({ name, price, features, isHighlighted = false, isEnterprise = false }) => (
  <div className={`card1 ${isHighlighted ? 'highlighted' : ''}`}>
    <div className="card1-header">
      <h3 className="card1-title">{name}</h3>
      <p className="card1-description">
        {isEnterprise ? 'Custom pricing' : (
          <span className="card1-price">${price}<span className="per-month">/month</span></span>
        )}
      </p>
    </div>
    <div className="card1-content">
      <ul>
        {features.map((feature, index) => (
          <li key={index} className="feature">
            ✔ {feature}
          </li>
        ))}
      </ul>
    </div>
    <div className="card1-footer">
      <button className={`btn ${isHighlighted ? 'btn-primary' : 'btn-outline'}`}>
        {isEnterprise ? 'Contact Us' : 'Sign Up'}
      </button>
    </div>
  </div>
);

const CompareTable = () => (
  <table className="compare-table">
    <thead>
      <tr>
        <th>Feature</th>
        <th>Basic</th>
        <th>Pro</th>
        <th>Enterprise</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Resume Matching</td>
        <td>✔</td>
        <td>✔</td>
        <td>✔</td>
      </tr>
      <tr>
        <td>AI Question Generation</td>
        <td>✔</td>
        <td>✔</td>
        <td>✔</td>
      </tr>
      <tr>
        <td>Custom Branding</td>
        <td>✘</td>
        <td>✔</td>
        <td>✔</td>
      </tr>
      <tr>
        <td>API Access</td>
        <td>✘</td>
        <td>✘</td>
        <td>✔</td>
      </tr>
      <tr>
        <td>Dedicated Support</td>
        <td>✘</td>
        <td>✘</td>
        <td>✔</td>
      </tr>
    </tbody>
  </table>
);

export default function Pricing() {
  return (
    <div className="pricing-page">
      <div className="header1">
        <h2>Simple, transparent pricing</h2>
        <p>Choose the plan that's right for you</p>
      </div>

      <div className="pricing-tiers">
        <PricingTier
          name="Basic"
          price={49}
          features={[
            "Up to 100 resume matches/month",
            "Basic AI question generation",
            "Email support",
            "1 user account"
          ]}
        />
        <PricingTier
          name="Pro"
          price={99}
          features={[
            "Up to 500 resume matches/month",
            "Advanced AI question generation",
            "Priority email support",
            "5 user accounts"
          ]}
          isHighlighted={true}
        />
        <PricingTier
          name="Enterprise"
          price={null}
          features={[
            "Unlimited resume matches",
            "Custom AI model training",
            "24/7 phone & email support",
            "Unlimited user accounts"
          ]}
          isEnterprise={true}
        />
      </div>

      <div className="compare-section">
        <h3>Compare Plans</h3>
        <CompareTable />
      </div>
    </div>
  );
}
