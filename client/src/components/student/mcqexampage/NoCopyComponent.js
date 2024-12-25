import React, { useState, useEffect } from "react";
const NoCopyComponent = ({ onPermissionGranted }) => {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  const handleGrantPermission = () => {
    setIsPermissionGranted(true);
    onPermissionGranted();
  };

  useEffect(() => {
    if (isPermissionGranted) {
      const handleContextMenu = (e) => e.preventDefault(); // Prevent right-click
      const handleCopy = (e) => {
        e.preventDefault();
        alert("Copying is not allowed on this page.");
      };
      const handleCut = (e) => {
        e.preventDefault();
        alert("Cutting is not allowed on this page.");
      };
      const handlePaste = (e) => {
        e.preventDefault();
        alert("Pasting is not allowed on this page.");
      };

      document.addEventListener("contextmenu", handleContextMenu);
      document.addEventListener("copy", handleCopy);
      document.addEventListener("cut", handleCut);
      document.addEventListener("paste", handlePaste);

      return () => {
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener("copy", handleCopy);
        document.removeEventListener("cut", handleCut);
        document.removeEventListener("paste", handlePaste);
      };
    }
  }, [isPermissionGranted]);

 
  return (
    <>
      {!isPermissionGranted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-4">
              Permission Required
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              To proceed, please agree to the following:
              <br />
              - Copying, cutting, and pasting will be disabled for this exam.
              <br />
              - Right-click functionality will also be restricted.
            </p>
            <button
              onClick={handleGrantPermission}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              I Agree
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NoCopyComponent;
