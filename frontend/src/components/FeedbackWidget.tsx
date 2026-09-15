import React, { useState } from 'react';
import './FeedbackWidget.css';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bug'); // 'bug', 'feature', 'review'
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // Formspree endpoint to send emails directly to the user
  const FORM_ENDPOINT = "https://formspree.io/f/mwlkdawn"; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!FORM_ENDPOINT) {
      // Fallback if no endpoint is set: just simulate a success for now
      setStatus('submitting');
      setTimeout(() => {
        setStatus('success');
        setMessage('');
        setTimeout(() => {
          setIsOpen(false);
          setStatus('idle');
        }, 3000);
      }, 800);
      return;
    }

    setStatus('submitting');
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: feedbackType,
          email: email || 'Anonymous',
          message: message,
          url: window.location.href, // Captures what page they are on
        }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('');
        setTimeout(() => {
          setIsOpen(false);
          setStatus('idle');
        }, 3000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        className="feedback-float-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Give Feedback"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <span>Feedback</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="feedback-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="feedback-header">
              <h3>Help us improve NodeSim</h3>
              <button className="close-btn" onClick={() => setIsOpen(false)}>&times;</button>
            </div>

            {status === 'success' ? (
              <div className="feedback-success">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <h4>Thank you!</h4>
                <p>Your feedback has been sent directly to the developers.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="feedback-form">
                <div className="form-group">
                  <label>I want to...</label>
                  <div className="feedback-types">
                    <button 
                      type="button" 
                      className={feedbackType === 'bug' ? 'active' : ''} 
                      onClick={() => setFeedbackType('bug')}
                    >
                      🐛 Report a Bug
                    </button>
                    <button 
                      type="button" 
                      className={feedbackType === 'feature' ? 'active' : ''} 
                      onClick={() => setFeedbackType('feature')}
                    >
                      ✨ Request Feature
                    </button>
                    <button 
                      type="button" 
                      className={feedbackType === 'review' ? 'active' : ''} 
                      onClick={() => setFeedbackType('review')}
                    >
                      💬 Leave a Review
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="fb-message">Message</label>
                  <textarea 
                    id="fb-message"
                    required
                    rows={4}
                    placeholder="Tell us what's on your mind..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fb-email">Email</label>
                  <input 
                    type="email" 
                    id="fb-email"
                    required
                    placeholder="So we can follow up with you"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {status === 'error' && (
                  <div className="feedback-error">Something went wrong. Please try again.</div>
                )}

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? 'Sending...' : 'Send Feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
