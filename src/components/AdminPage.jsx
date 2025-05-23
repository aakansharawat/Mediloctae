import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// API endpoint base URL
const API_BASE_URL = 'http://localhost:5000';

// Mock data representing medicines
const initialMedicines = [
  { id: 1, name: 'Aspirin', brand: 'Bayer', quantity: 120, expiryDate: '2024-12-31' },
  { id: 2, name: 'Ibuprofen', brand: 'Advil', quantity: 85, expiryDate: '2024-06-30' },
  { id: 3, name: 'Paracetamol', brand: 'Tylenol', quantity: 50, expiryDate: '2023-11-15' },
  { id: 4, name: 'Amoxicillin', brand: 'Amoxil', quantity: 30, expiryDate: '2023-12-10' },
  { id: 5, name: 'Cetirizine', brand: 'Zyrtec', quantity: 10, expiryDate: '2025-01-20' },
  { id: 6, name: 'Loratadine', brand: 'Claritin', quantity: 25, expiryDate: '2024-08-15' }
];

// Threshold for low stock
const LOW_STOCK_THRESHOLD = 30;

// Function to check if a medicine is expiring soon (within 30 days)
const isExpiringSoon = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
};

// Function to check if a medicine has already expired
const isExpired = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  return expiry < today;
};

// Function to get low stock medicines
const getLowStockMedicines = (medicines) => {
  return medicines.filter(medicine => medicine.quantity <= LOW_STOCK_THRESHOLD);
};

// Function to get soon expiring medicines
const getExpiringSoonMedicines = (medicines) => {
  return medicines.filter(medicine => isExpiringSoon(medicine.expiryDate));
};

// Function to get expired medicines
const getExpiredMedicines = (medicines) => {
  return medicines.filter(medicine => isExpired(medicine.expiryDate));
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    quantity: '',
    expiryDate: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [csvContent, setCsvContent] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [expiryTrackingAvailable, setExpiryTrackingAvailable] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(LOW_STOCK_THRESHOLD);

  // Fetch medicines data from API on component mount
  useEffect(() => {
    fetchMedicines();
    checkExpiryTracking();
  }, []);

  // Fetch all medicines
  const fetchMedicines = async () => {
    setLoading(true);
    try {
      // If expiry tracking is available, use the C++ implementation
      if (expiryTrackingAvailable && activeTab === 'expiringSoon') {
        const response = await axios.get(`${API_BASE_URL}/expiring_medicines`);
        setMedicines(response.data.results);
      } else if (activeTab === 'lowStock') {
        const response = await axios.get(`${API_BASE_URL}/low_stock_medicines?threshold=${lowStockThreshold}`);
        setMedicines(response.data.results);
      } else {
        // Default fetch all medicines
        const response = await axios.get(`${API_BASE_URL}/search_medicine?name=`);
        setMedicines(response.data.results || []);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching medicines:', err);
      setError('Failed to load medicines. Please try again later.');
      // Fallback to mock data if API is not available
      setMedicines([
        { id: 1, name: 'Aspirin', brand: 'Bayer', quantity: 120, expiryDate: '2024-12-31' },
        { id: 2, name: 'Ibuprofen', brand: 'Advil', quantity: 85, expiryDate: '2024-06-30' },
        { id: 3, name: 'Paracetamol', brand: 'Tylenol', quantity: 50, expiryDate: '2023-11-15' },
        { id: 4, name: 'Amoxicillin', brand: 'Amoxil', quantity: 30, expiryDate: '2023-12-10' },
        { id: 5, name: 'Cetirizine', brand: 'Zyrtec', quantity: 10, expiryDate: '2025-01-20' },
        { id: 6, name: 'Loratadine', brand: 'Claritin', quantity: 25, expiryDate: '2024-08-15' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Check if expiry tracking is available
  const checkExpiryTracking = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      setExpiryTrackingAvailable(response.data.expiry_tracking_available || false);
    } catch (err) {
      console.error('Health check failed:', err);
      setExpiryTrackingAvailable(false);
    }
  };

  // Handle tab change
  useEffect(() => {
    fetchMedicines();
  }, [activeTab, lowStockThreshold]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle CSV file upload
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create FormData object for the file upload
      const formData = new FormData();
      formData.append('file', file);

      // Reset status
      setUploadStatus('Uploading...');

      // Upload to the server
      axios.post(`${API_BASE_URL}/upload_medicines`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        setUploadStatus(`Success! Uploaded ${response.data.medicines.length} medicines.`);
        // Refresh medicines list
        fetchMedicines();
      })
      .catch(error => {
        console.error('Upload error:', error);
        setUploadStatus(`Error: ${error.response?.data?.error || 'Upload failed'}`);
      });
    }
  };

  // Get filtered medicines based on active tab
  const getFilteredMedicines = () => {
    switch (activeTab) {
      case 'lowStock':
        return getLowStockMedicines(medicines);
      case 'expiringSoon':
        return getExpiringSoonMedicines(medicines);
      case 'expired':
        return getExpiredMedicines(medicines);
      default:
        return medicines;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.brand || !formData.quantity || !formData.expiryDate) {
      alert('Please fill all fields');
      return;
    }
    
    try {
      if (editingId === null) {
        // Add new medicine
        const response = await axios.post(`${API_BASE_URL}/add_medicine_item`, {
          name: formData.name,
          brand: formData.brand,
          quantity: parseInt(formData.quantity, 10),
          expiryDate: formData.expiryDate
        });
        
        // Refresh medicines list
        fetchMedicines();
      } else {
        // Update existing medicine logic
        // Note: Update API would need to be implemented
        setMedicines(
          medicines.map(medicine =>
            medicine.id === editingId
              ? {
                  ...medicine,
                  name: formData.name,
                  brand: formData.brand,
                  quantity: parseInt(formData.quantity, 10),
                  expiryDate: formData.expiryDate
                }
              : medicine
          )
        );
        setEditingId(null);
      }
      
      // Reset form
      setFormData({
        name: '',
        brand: '',
        quantity: '',
        expiryDate: ''
      });
    } catch (err) {
      console.error('Error saving medicine:', err);
      alert(`Error: ${err.response?.data?.error || 'Failed to save medicine'}`);
    }
  };

  // Load medicine data into form for editing
  const handleEdit = (medicine) => {
    setFormData({
      name: medicine.name,
      brand: medicine.brand,
      quantity: medicine.quantity.toString(),
      expiryDate: medicine.expiryDate
    });
    setEditingId(medicine.id);
  };

  // Delete a medicine
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      // Note: Delete API would need to be implemented
      // For now, we'll just filter the medicines locally
      setMedicines(medicines.filter(medicine => medicine.id !== id));
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      name: '',
      brand: '',
      quantity: '',
      expiryDate: ''
    });
  };

  // Handle threshold change
  const handleThresholdChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setLowStockThreshold(value);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-blue-600">Medilocate</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/dashboard/admin" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Admin Dashboard
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Medicine Inventory Management</h1>
          </div>
        </header>
        
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              {/* Medicine Management System */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Pharmacy Inventory</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your medicine stock</p>
                  </div>
                  
                  {/* Expiry Tracking Status */}
                  <div className="text-sm text-gray-500">
                    {expiryTrackingAvailable ? (
                      <span className="text-green-600 font-medium">C++ MinHeap expiry tracking enabled</span>
                    ) : (
                      <span className="text-yellow-600 font-medium">Using JavaScript fallback for expiry tracking</span>
                    )}
                  </div>
                </div>
                
                {/* CSV Upload Section */}
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Bulk Upload</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload CSV File (format: name,brand,quantity,expiryDate)
                    </label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="block w-full text-sm text-gray-500 
                                file:mr-4 file:py-2 file:px-4 
                                file:rounded-md file:border-0 
                                file:text-sm file:font-semibold 
                                file:bg-blue-50 file:text-blue-700 
                                hover:file:bg-blue-100"
                    />
                    <p className="mt-2 text-xs text-gray-500">CSV file should have headers: name,brand,quantity,expiryDate</p>
                    
                    {/* Upload Status */}
                    {uploadStatus && (
                      <div className={`mt-2 text-sm ${uploadStatus.startsWith('Error') ? 'text-red-600' : uploadStatus.startsWith('Success') ? 'text-green-600' : 'text-blue-600'}`}>
                        {uploadStatus}
                      </div>
                    )}
                  </div>
                </div>

                {/* Add/Edit Medicine Form */}
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {editingId === null ? 'Add New Medicine' : 'Edit Medicine'}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Medicine Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                          Brand
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="brand"
                            id="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                          Quantity
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            name="quantity"
                            id="quantity"
                            min="0"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                          Expiry Date
                        </label>
                        <div className="mt-1">
                          <input
                            type="date"
                            name="expiryDate"
                            id="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      {editingId !== null && (
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {editingId === null ? 'Add Medicine' : 'Update Medicine'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Low Stock Threshold Control */}
                {activeTab === 'lowStock' && (
                  <div className="border-t border-gray-200 px-4 py-3 sm:px-6 bg-gray-50">
                    <div className="flex items-center">
                      <label htmlFor="threshold" className="mr-3 text-sm font-medium text-gray-700">
                        Low Stock Threshold:
                      </label>
                      <input
                        type="number"
                        id="threshold"
                        min="0"
                        value={lowStockThreshold}
                        onChange={handleThresholdChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md w-24"
                      />
                    </div>
                  </div>
                )}

                {/* Medicine List Tabs */}
                <div className="border-t border-gray-200">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-4 sm:px-6" aria-label="Tabs">
                      <button
                        onClick={() => setActiveTab('all')}
                        className={`${
                          activeTab === 'all'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        All Medicines ({medicines.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('lowStock')}
                        className={`${
                          activeTab === 'lowStock'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        Low Stock ({getLowStockMedicines(medicines).length})
                      </button>
                      <button
                        onClick={() => setActiveTab('expiringSoon')}
                        className={`${
                          activeTab === 'expiringSoon'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        Expiring Soon ({getExpiringSoonMedicines(medicines).length})
                      </button>
                      <button
                        onClick={() => setActiveTab('expired')}
                        className={`${
                          activeTab === 'expired'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        Expired ({getExpiredMedicines(medicines).length})
                      </button>
                    </nav>
                  </div>
                  
                  {/* Loading and Error States */}
                  {loading && (
                    <div className="text-center py-6 flex justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                  
                  {error && !loading && (
                    <div className="text-center py-6">
                      <p className="text-red-600">{error}</p>
                    </div>
                  )}
                  
                  {/* Medicine Table */}
                  {!loading && !error && (
                    <div className="flex flex-col">
                      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Brand
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Expiry Date
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {getFilteredMedicines().map((medicine) => (
                                  <tr key={medicine.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-500">{medicine.brand}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className={`text-sm ${
                                        medicine.quantity <= lowStockThreshold ? 'text-red-500 font-semibold' : 'text-gray-500'
                                      }`}>
                                        {medicine.quantity}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-500">{medicine.expiryDate}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {isExpired(medicine.expiryDate) ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                          Expired
                                        </span>
                                      ) : isExpiringSoon(medicine.expiryDate) ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                          Expiring Soon
                                        </span>
                                      ) : medicine.quantity <= lowStockThreshold ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                                          Low Stock
                                        </span>
                                      ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                          In Stock
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button
                                        onClick={() => handleEdit(medicine)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDelete(medicine.id)}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {getFilteredMedicines().length === 0 && (
                                  <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                                      No medicines found
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage; 