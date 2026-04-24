import { useEffect, useState } from 'react';

function FlashMessage({ success, error, onDismiss }) {
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [showError, setShowError] = useState(!!error);

  useEffect(() => {
    setShowSuccess(!!success);
    setShowError(!!error);
  }, [success, error]);

  if (!showSuccess && !showError) return null;

  return (
    <>
      {showSuccess && success && (
        <div className="alert alert-success alert-dismissible fade show col-8 offset-2" role="alert">
          {success}
          <button 
            type="button" 
            className="btn-close" 
            data-bs-dismiss="alert" 
            aria-label="Close"
            onClick={() => {
              setShowSuccess(false);
              if (onDismiss) onDismiss('success');
            }}
          ></button>
        </div>
      )}

      {showError && error && (
        <div className="alert alert-danger alert-dismissible fade show col-8 offset-2" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            data-bs-dismiss="alert" 
            aria-label="Close"
            onClick={() => {
              setShowError(false);
              if (onDismiss) onDismiss('error');
            }}
          ></button>
        </div>
      )}
    </>
  );
}

export default FlashMessage;

