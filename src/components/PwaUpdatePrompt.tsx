import React from 'react';

interface PwaUpdatePromptProps {
  /** Provided by registerServiceWorker — call it to activate the new SW + reload. */
  apply: () => Promise<void>;
  onDismiss: () => void;
}

/**
 * Shown when the service worker has fetched a new app version in the
 * background. Tapping "Update" calls the apply() callback which
 * activates the new SW and reloads the page.
 */
const PwaUpdatePrompt: React.FC<PwaUpdatePromptProps> = ({ apply, onDismiss }) => {
  return (
    <div className="bs-pwa-banner bs-pwa-banner--update" role="status">
      <div className="bs-pwa-banner__text">
        <strong>New version available</strong>
        <span>Refresh to get the latest improvements.</span>
      </div>
      <div className="bs-pwa-banner__actions">
        <button className="bs-pwa-banner__btn" onClick={onDismiss}>
          Later
        </button>
        <button
          className="bs-pwa-banner__btn bs-pwa-banner__btn--primary"
          onClick={() => apply().catch(() => undefined)}
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default PwaUpdatePrompt;
