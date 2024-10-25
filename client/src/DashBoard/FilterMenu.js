import React from 'react';

const FilterMenu = ({ isOpen, onClose, onFilter }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900 opacity-50" onClick={onClose} />
      <div className="bg-white rounded-lg shadow-lg p-4 z-10">
        <h3 className="text-lg font-semibold mb-2">Filter Options</h3>
        <div className="space-y-2">
          <button
            onClick={() => onFilter('unread')}
            className="w-full text-left p-2 hover:bg-gray-200 rounded-md"
          >
            Unread Emails
          </button>
          <button
            onClick={() => onFilter('attachments')}
            className="w-full text-left p-2 hover:bg-gray-200 rounded-md"
          >
            Emails with Attachments
          </button>
          <button
            onClick={() => onFilter('from')}
            className="w-full text-left p-2 hover:bg-gray-200 rounded-md"
          >
            Filter by Sender
          </button>
          <button
            onClick={() => onFilter('date')}
            className="w-full text-left p-2 hover:bg-gray-200 rounded-md"
          >
            Filter by Date
          </button>
          {/* Add more filter options as needed */}
        </div>
      </div>
    </div>
  );
};

export default FilterMenu;
