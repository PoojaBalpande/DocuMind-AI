'use client';

import { useEffect } from 'react';

export default function GoogleAuthCallbackPage() {
  useEffect(() => {
    // Google returns tokens in the URL hash for response_type=id_token
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const idToken = params.get('id_token');
    const error = params.get('error');

    if (idToken) {
      if (window.opener) {
        window.opener.postMessage(
          { type: 'GOOGLE_OAUTH_SUCCESS', token: idToken },
          window.location.origin
        );
      }
    } else if (error) {
      if (window.opener) {
        window.opener.postMessage(
          { type: 'GOOGLE_OAUTH_FAILURE', error },
          window.location.origin
        );
      }
    } else {
      // Check query parameters in case they got returned as query params
      const queryParams = new URLSearchParams(window.location.search);
      const queryIdToken = queryParams.get('id_token');
      const queryError = queryParams.get('error');
      
      if (queryIdToken) {
        if (window.opener) {
          window.opener.postMessage(
            { type: 'GOOGLE_OAUTH_SUCCESS', token: queryIdToken },
            window.location.origin
          );
        }
      } else if (queryError) {
        if (window.opener) {
          window.opener.postMessage(
            { type: 'GOOGLE_OAUTH_FAILURE', error: queryError },
            window.location.origin
          );
        }
      } else {
        if (window.opener) {
          window.opener.postMessage(
            { type: 'GOOGLE_OAUTH_FAILURE', error: 'No token returned' },
            window.location.origin
          );
        }
      }
    }
    
    // Close the popup window
    window.close();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-xl max-w-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto mb-lg"></div>
        <p className="text-body-lg text-primary font-medium animate-pulse">Completing Sign In...</p>
        <p className="text-body-sm text-on-surface-variant mt-sm">This window will close automatically.</p>
      </div>
    </div>
  );
}
