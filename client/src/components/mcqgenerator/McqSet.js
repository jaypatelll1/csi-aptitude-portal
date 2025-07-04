import React from "react";
import {
  FileQuestion,
  FileText,
  Clock,
  Tag,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

const McqSet = ({
  mcqSet,
  selectedQuestions,
  collapsedSets,
  onQuestionCheckbox,
  onSelectAllSet,
  onToggleSetCollapse,
  onDeleteSet,
  formatTime,
  formatDate,
}) => {
  const allQuestionIds = mcqSet.mcqs.map((q) => q.id);
  const setSelected = selectedQuestions[mcqSet.id] || new Set();
  const allSelected =
    setSelected.size === allQuestionIds.length && allQuestionIds.length > 0;
  const anySelected = setSelected.size > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <FileQuestion className="w-4 h-4 text-green-600" />
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 flex-1">
          {/* MCQ Set Header */}
          <div className="px-4 py-3 border-b border-green-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Set-level Checkbox */}
              <input
                type="checkbox"
                checked={allSelected}
                indeterminate={
                  anySelected && !allSelected ? "indeterminate" : undefined
                }
                onChange={() => onSelectAllSet(mcqSet.id, allQuestionIds)}
                className="form-checkbox h-5 w-5 text-green-600"
                id={`select-set-${mcqSet.id}`}
              />
              <label
                htmlFor={`select-set-${mcqSet.id}`}
                className="ml-2 text-xs text-green-700 font-semibold"
                title="Select/Deselect all questions in this set"
              >
                Select Set
              </label>
              <h3 className="font-semibold text-green-800">
                📚 {mcqSet.topic}
              </h3>
              <div className="flex items-center space-x-2 text-xs">
                <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full">
                  {mcqSet.difficulty}
                </span>
                <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                  {mcqSet.questionType}
                </span>
                <span className="text-green-700">
                  {mcqSet.mcqs.length} questions
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-green-600">
                {formatDate(mcqSet.timestamp)}
              </span>
              <button
                onClick={() => onToggleSetCollapse(mcqSet.id)}
                className="text-green-600 hover:text-green-800 p-1"
              >
                {collapsedSets.has(mcqSet.id) ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => onDeleteSet(mcqSet.id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* MCQ Set Content */}
          {!collapsedSets.has(mcqSet.id) && (
            <div className="p-4">
              {mcqSet.fileName && (
                <div className="mb-4 flex items-center space-x-2 text-sm text-green-700">
                  <FileText className="w-4 h-4" />
                  <span>Source: {mcqSet.fileName}</span>
                </div>
              )}
              <div className="space-y-6">
                {mcqSet.mcqs.map((mcq, index) => (
                  <div
                    key={mcq.id || index}
                    className="bg-white border rounded-lg p-5 shadow-sm"
                  >
                    {/* Checkbox for this question */}
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={setSelected.has(mcq.id)}
                        onChange={() => onQuestionCheckbox(mcqSet.id, mcq.id)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                        id={`select-q-${mcqSet.id}-${mcq.id}`}
                      />
                      <label
                        htmlFor={`select-q-${mcqSet.id}-${mcq.id}`}
                        className="ml-2 text-xs text-gray-500"
                      >
                        Select
                      </label>
                    </div>
                    
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold text-gray-800 text-lg flex-1">
                        Question {index + 1}: {mcq.question}
                      </h4>
                      <div className="flex items-center space-x-2 ml-4">
                        {mcq.estimated_time_seconds && (
                          <div className="flex items-center space-x-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(mcq.estimated_time_seconds)}</span>
                          </div>
                        )}
                        {mcq.bloom_level && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            {mcq.bloom_level.charAt(0).toUpperCase() +
                              mcq.bloom_level.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 mb-4">
                      {mcq.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className="flex items-center space-x-3"
                        >
                          <div
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                              optIndex === mcq.correct_answer
                                ? "bg-green-100 border-green-500 text-green-700"
                                : "border-gray-300 text-gray-600 bg-gray-50"
                            }`}
                          >
                            {String.fromCharCode(65 + optIndex)}
                          </div>
                          <span
                            className={`text-base flex-1 ${
                              optIndex === mcq.correct_answer
                                ? "text-green-700 font-semibold"
                                : "text-gray-700"
                            }`}
                          >
                            {option}
                          </span>
                          {optIndex === mcq.correct_answer && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              Correct Answer
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    {mcq.explanation && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>💡 Explanation:</strong> {mcq.explanation}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {mcq.tags && mcq.tags.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <div className="flex flex-wrap gap-1">
                          {mcq.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default McqSet;