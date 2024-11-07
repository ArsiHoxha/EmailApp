import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';

export default function Workspace() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [error, setError] = useState('');
  const [workspaces, setWorkspaces] = useState([]);
  
  const images = [
    "https://images.unsplash.com/photo-1444580442178-56153ed65706?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://plus.unsplash.com/premium_photo-1661964177687-57387c2cbd14?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-2.jpg",
    "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-3.jpg",
    "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-4.jpg",
    "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-5.jpg",
  ];

  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token from localStorage
        if (!token) {
          navigate('/'); // Redirect if token is missing
          return;
        }

        const response = await axios.get('http://localhost:8080/api/workspaces', {
          headers: {
            Authorization: `Bearer ${token}` // Attach token to request
          }
        });

        setWorkspaces(response.data);
      } catch (err) {
        navigate('/');
        console.error('Failed to load workspaces:', err);
        setError('Failed to load workspaces. Please try again later.');
      }
    };

    fetchWorkspaces();
  }, [navigate]);

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setWorkspaceName('');
    setSelectedImage('');
    setError('');
  };

  const createWorkspace = async (e) => {
    e.preventDefault();

    if (!workspaceName || !selectedImage) {
      setError('Workspace name and background image are required.');
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        navigate('/'); // Redirect if token is missing
        return;
      }

      const response = await axios.post(
        'http://localhost:8080/api/workspaces',
        { name: workspaceName, backgroundImage: selectedImage },
        {
          headers: {
            Authorization: `Bearer ${token}` // Attach token to request
          }
        }
      );

      setWorkspaces([...workspaces, response.data]);
      closePopup();
    } catch (err) {
      setError('Failed to create workspace. Please try again.');
      console.error('Failed to create workspace:', err);
    }
  };

  const handleImageSelect = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleWorkspaceClick = (workspaceName) => {
    navigate(`/workspace/${workspaceName}`);
  };

  const handleDeleteWorkspace = async (workspaceId) => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        navigate('/'); // Redirect if token is missing
        return;
      }

      const response = await axios.post(
        'http://localhost:8080/api/workspaces/delete',
        { workspaceId },
        {
          headers: {
            Authorization: `Bearer ${token}` // Attach token to request
          }
        }
      );

      alert(response.data.message); // "Workspace deleted successfully"
      window.location.reload();
    } catch (error) {
      if (error.response) {
        console.error('Error:', error.response.data.message);
      } else {
        console.error('Error:', error.message);
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center h-screen ">
      <div className="text-center font-black text-3xl p-5">Workspaces</div>
      <div className="text-center pb-10">
        Effortlessly manage your projects and emails in a personalized space designed to keep you organized and focused 🔥🔥🔥
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {workspaces.map((workspace) => (
          <div
            key={workspace._id}
            className="relative border rounded-lg overflow-hidden h-48 group"
          >
            <img
              src={workspace.imageUrl || images[0]}
              alt={`Workspace ${workspace.name}`}
              className="w-full h-full object-cover rounded-lg cursor-pointer"
              onClick={() => handleWorkspaceClick(workspace.name)}
            />

            <div
              className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center hover:opacity-50 transition-opacity duration-300"
              onClick={() => handleWorkspaceClick(workspace.name)}
            >
              <h3 className="text-xl font-semibold text-white">{workspace.name}</h3>
            </div>

            <div className="absolute top-2 right-2 z-10">
              <FaTrash
                className="text-white bg-red-500 rounded-full p-2 hover:bg-red-600 cursor-pointer"
                size={24}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteWorkspace(workspace._id);
                }}
              />
            </div>
          </div>
        ))}

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          onClick={openPopup}
        >
          Create Workspace
        </button>
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative">
            <h2 className="text-2xl font-bold mb-4">Create Workspace</h2>

            <form onSubmit={createWorkspace}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Workspace Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Background Image</label>
                <div className="grid grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className={`border-2 rounded-lg cursor-pointer ${selectedImage === image ? 'border-green-500' : 'border-gray-300'}`}
                      onClick={() => handleImageSelect(image)}
                    >
                      <img
                        src={image}
                        alt={`Background option ${index + 1}`}
                        className="h-32 w-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-500 mb-4">{error}</p>}

              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-red-500 text-white px-4 py-2 rounded-lg mr-2"
                  onClick={closePopup}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-lg"
                  disabled={!selectedImage}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
