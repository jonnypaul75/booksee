import React from 'react';

interface OfflineIndicatorProps {
  online: boolean;
}

/**
 * Slim banner shown at the top of the screen whenever the device is
 * offline. Hides itself when connectivity returns.
 */
const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ online }) => {
  if (online) return null;
  return (
    <div className="bs-pwa-offline" role="status" aria-live="polite">
      <span className="bs-pwa-offline__dot" />
      Offline — showing cached content
    </div>
  );
};

export default OfflineIndicator;
