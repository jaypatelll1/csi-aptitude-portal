import React from "react";

function UploadImage({ onFileChange, onSubmit, isUploading }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700" htmlFor="image-upload">
          Upload Your Image:
        </label>
        <input
          type="file"
          id="image-upload"
          name="image"
          accept="image/*" // Accept all image types
          onChange={onFileChange}
          className="border border-gray-300 rounded-md px-3 py-2"
          disabled={isUploading} // Disable file input while uploading
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        disabled={isUploading} // Disable the button while uploading
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}

export default UploadImage;
