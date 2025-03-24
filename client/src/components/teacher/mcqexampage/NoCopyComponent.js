import React, { useState, useEffect } from "react";

const NoCopyComponent = ({ onPermissionGranted }) => {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleGrantPermission = () => {
    setIsPermissionGranted(true);
    onPermissionGranted();
  };

  useEffect(() => {
    if (isPermissionGranted) {
      const handleContextMenu = (e) => e.preventDefault(); // Prevent right-click

      const handleCopy = (e) => {
        e.preventDefault();
        setAlertMessage("Copying is not allowed on this page.");
        setIsAlertVisible(true);
      };

      const handleCut = (e) => {
        e.preventDefault();
        setAlertMessage("Cutting is not allowed on this page.");
        setIsAlertVisible(true);
      };

      const handlePaste = (e) => {
        e.preventDefault();
        setAlertMessage("Pasting is not allowed on this page.");
        setIsAlertVisible(true);
      };

      const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
          setAlertMessage(
            "Fullscreen mode is required for a secure exam. Please return to fullscreen to continue."
          );
          setIsAlertVisible(true);
        }
      };

      document.addEventListener("contextmenu", handleContextMenu);
      document.addEventListener("copy", handleCopy);
      document.addEventListener("cut", handleCut);
      document.addEventListener("paste", handlePaste);
      document.addEventListener("fullscreenchange", handleFullscreenChange);

      return () => {
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener("copy", handleCopy);
        document.removeEventListener("cut", handleCut);
        document.removeEventListener("paste", handlePaste);
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
      };
    }
  }, [isPermissionGranted]);

  const handleCloseAlert = () => {
    setIsAlertVisible(false);
    setAlertMessage("");
  };

  return (
    <>
      {!isPermissionGranted && (
        <div className="fixed inset-0 z-50">
          {/* Blurred Background */}
          <div className="fixed inset-0 backdrop-blur-md bg-black bg-opacity-50"></div>

          {/* Permission Modal */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
              <h2 className="text-lg font-semibold mb-4">Permission Required</h2>
              <p className="text-sm text-gray-600 mb-6">
                To proceed, please agree to the following:
                <br />
                - Copying, cutting, and pasting will be disabled for this exam.
                <br />- Right-click functionality will also be restricted.
              </p>
              <button
                onClick={handleGrantPermission}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {isAlertVisible && (
        <div className="fixed inset-0 z-50">
          {/* Blurred Background */}
          <div className="fixed inset-0 backdrop-blur-md bg-black bg-opacity-50"></div>

          {/* Alert Modal */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
              <h2 className="text-lg font-semibold mb-4">Alert</h2>
              <p className="text-sm text-gray-600 mb-6">{alertMessage}</p>
              <button
                onClick={handleCloseAlert}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NoCopyComponent;
