import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import NavbarDashboard from './NavbarDash';
export default function PersDashboard() {
  const { name } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [error, setError] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspaceAndEmails = async () => {
      try {
        const workspaceResponse = await axios.get(`http://localhost:8080/api/workspaces/${name}`, { withCredentials: true });
        const emailsResponse = await axios.get(`http://localhost:8080/api/workspaces/${name}/emails`, { withCredentials: true });

        const updatedWorkspace = {
          ...workspaceResponse.data,
          lists: workspaceResponse.data.lists.map(list => ({
            ...list,
            emails: emailsResponse.data.emails.filter(email => email.listName === list.name)
          }))
        };

        setWorkspace(updatedWorkspace);
      } catch (err) {
        setError('Failed to fetch workspace details or emails');
        console.error('Error fetching workspace details or emails:', err);
        navigate('/');
      }
    };

    fetchWorkspaceAndEmails();
  }, [name]);

  const handleCreateList = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `http://localhost:8080/api/workspaces/${name}/${newListName}`,
        { workspaceName: name, listName: newListName },
        { withCredentials: true }
      );

      setWorkspace((prevWorkspace) => ({
        ...prevWorkspace,
        lists: [...prevWorkspace.lists, response.data]
      }));

      setNewListName('');
    } catch (err) {
      setError('Failed to create a new list');
      console.error('Failed to create a new list:', err);
    }
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmail(null);
  };

  const getGmailUrl = (emailId) => {
    return `https://mail.google.com/mail/u/0/#inbox/${emailId}`;
  };

  const handleFilterClick = (listName) => {
    // Implement filtering logic here
    console.log(`Filter clicked for list: ${listName}`);
  };

  return (
    <div>
      <NavbarDashboard></NavbarDashboard>

      <div
        className="p-8 min-h-screen"

        style={{
          backgroundImage: workspace ? `url(${workspace.imageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >

        {error && <p className="text-red-500">{error}</p>}

        {workspace ? (
          <div className="bg-opacity-80 rounded-lg p-6">
            <div className="mb-6">
              <form onSubmit={handleCreateList} className="flex space-x-4">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="New list name"
                  className="p-2 border border-gray-300 rounded-lg"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Create List
                </button>
              </form>
            </div>

            <div className="flex flex-wrap space-x-4">
              {workspace.lists && workspace.lists.length > 0 ? (
                workspace.lists.map((list, index) => (
                  <div
                    key={index}
                    className="w-64 bg-white p-4 rounded-lg shadow-lg mb-4"
                    style={{
                      background: '#f4f5f7',
                      minHeight: '150px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">{list.name}</h3>
                      <FontAwesomeIcon
                        icon={faEllipsisV}
                        className="cursor-pointer"
                        onClick={() => handleFilterClick(list.name)}
                      />
                    </div>

                    <div className="mt-2 overflow-y-auto" style={{ maxHeight: '500px' }}>
                      {list.emails && list.emails.length > 0 ? (
                        <ul className="space-y-2">
                          {list.emails.map((email, idx) => (
                            <li
                              key={idx}
                              className="bg-gray-100 p-2 rounded-lg shadow cursor-pointer hover:bg-gray-200"
                              onClick={() => handleEmailClick(email)}
                            >
                              <div className="text-gray-700">{email.subject}</div>
                              <div className="text-xs text-gray-500">{email.from}</div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">No emails in this list.</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>No lists found for this workspace.</p>
              )}
            </div>

            {isModalOpen && selectedEmail && (
              <div
                className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
                onClick={closeModal}
              >
                <div
                  className="bg-white rounded-lg p-8 max-w-lg w-full shadow-xl relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-2xl font-bold mb-4">{selectedEmail.subject}</h2>
                  <p className="text-gray-600 mb-4">From: {selectedEmail.from}</p>
                  <p className="text-gray-500 mb-8">{selectedEmail.body}</p>

                  <a
                    href={getGmailUrl(selectedEmail.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Open in Gmail
                  </a>

                  <button
                    onClick={closeModal}
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                  >
                    &times;
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p>Loading workspace details...</p>
        )}
      </div>
    </div>
  );
}
