import React from "react";
import { Upload, Send, ChevronDown, FileText, X } from "lucide-react";

const InputAreaComponent = ({
  topic,
  setTopic,
  difficulty,
  setDifficulty,
  numQuestions,
  setNumQuestions,
  questionType,
  setQuestionType,
  uploadedFile,
  setUploadedFile,
  isGenerating,
  handleFileUpload,
  handleGenerate,
}) => {
  return (
    <div className="bg-gray-50 border-t px-6 py-4 rounded-b-lg">
      <div className="flex flex-col lg:flex-row items-end space-y-3 lg:space-y-0 lg:space-x-3">
        {/* Form Controls */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
          {/* Topic Input */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Topic{" "}
              {!uploadedFile && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic (optional if PDF uploaded)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Difficulty
            </label>
            <div className="relative">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Questions 
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={numQuestions}
              placeholder="1-50"
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Question Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Type
            </label>
            <div className="relative">
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
              >
                <option value="academic">Academic</option>
                <option value="practical">Practical</option>
                <option value="conceptual">Conceptual</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* File Upload and Send Button */}
        <div className="flex items-end space-x-3">
          {/* File Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              PDF Upload (Max 16MB)
            </label>
            <label className="flex items-center justify-center w-10 h-10 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Upload size={18} className="text-gray-400" />
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Send Button */}
          <div>
            <label className="block text-xs font-medium text-transparent mb-1">
              Send
            </label>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center justify-center transition-colors shadow-md hover:shadow-lg"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* File Upload Status */}
      {uploadedFile && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600 bg-white p-3 rounded-lg border">
          <FileText size={16} className="text-blue-600" />
          <span>
            Uploaded: <strong>{uploadedFile.name}</strong> (
            {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB)
          </span>
          <button
            onClick={() => setUploadedFile(null)}
            className="text-red-500 hover:text-red-700 ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default InputAreaComponent;