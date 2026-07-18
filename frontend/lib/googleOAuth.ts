/**
 * Google OAuth helper for launching the authentication popup window.
 */
export function loginWithGooglePopup(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!clientId) {
      reject(new Error('Google Client ID is not configured.'));
      return;
    }

    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // Generate a random nonce for security
    const nonce = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    const redirectUri = `${window.location.origin}/auth-callback`;
    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=id_token&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20email%20profile&nonce=${nonce}`;

    const popup = window.open(url, 'google-oauth-popup', `width=${width},height=${height},left=${left},top=${top}`);

    if (!popup) {
      reject(new Error('Popup blocker prevented Google sign in popup. Please enable popups.'));
      return;
    }

    // Check if popup is closed by user (polling)
    const checkClosedInterval = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosedInterval);
        reject(new Error('Google sign in was cancelled.'));
      }
    }, 1000);

    const handleMessage = (event: MessageEvent) => {
      // Ensure the message comes from our own origin
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS') {
        clearInterval(checkClosedInterval);
        window.removeEventListener('message', handleMessage);
        resolve(event.data.token);
      } else if (event.data?.type === 'GOOGLE_OAUTH_FAILURE') {
        clearInterval(checkClosedInterval);
        window.removeEventListener('message', handleMessage);
        reject(new Error(event.data.error || 'Google login failed.'));
      }
    };

    window.addEventListener('message', handleMessage);
  });
}
