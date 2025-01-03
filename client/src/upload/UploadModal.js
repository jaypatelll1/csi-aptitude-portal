import React from "react";
import UploadForm from "./UploadForm";



const UploadModal = ({ isOpen, closeModal, onFileChange, onSubmit, isUploading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Upload Questions</h2>
        <UploadForm 
          onFileChange={onFileChange} 
          onSubmit={onSubmit} 
          isUploading={isUploading} 
        />
        <button
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          onClick={closeModal}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default UploadModal;

