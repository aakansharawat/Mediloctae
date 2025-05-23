import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const LoginSignupPage = ({ isLogin = true }) => {
  const location = useLocation();
  const [isLoginForm, setIsLoginForm] = useState(
    location.pathname === '/login' || isLogin
  );
  const [role, setRole] = useState('customer');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    shopName: '',
    shopLicense: '',
    shopAddress: '',
    shopLocation: '',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Clear login status when component mounts (for security)
  useEffect(() => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    // Clear role-specific errors when changing roles
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Common validations for both customer and seller
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLoginForm) {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      // Customer-specific validations
      if (role === 'customer') {
        if (!formData.location) {
          newErrors.location = 'Location is required';
        }
      }
      
      // Seller-specific validations
      if (role === 'seller') {
        if (!formData.shopName) {
          newErrors.shopName = 'Shop name is required';
        }
        if (!formData.shopLicense) {
          newErrors.shopLicense = 'Shop license/number is required';
        }
        if (!formData.shopAddress) {
          newErrors.shopAddress = 'Shop address is required';
        }
        if (!formData.shopLocation) {
          newErrors.shopLocation = 'Shop location is required';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLoginForm) {
      // For login, just check if email and password fields aren't empty
      if (formData.email && formData.password) {
        // Clear auth state first
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        
        // Then set new auth state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', role);
        
        // Force a storage event for cross-tab communication
        window.dispatchEvent(new Event('storage'));
        
        // Delay redirect slightly to ensure state is saved
        setTimeout(() => {
          // Redirect based on role
          if (role === 'customer') {
            navigate('/dashboard/search');
          } else {
            navigate('/dashboard/admin');
          }
        }, 100);
      } else {
        // Simple validation for empty fields
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        setErrors(newErrors);
      }
    } else {
      // For signup, use full validation
      if (validateForm()) {
        // Clear auth state first
        localStorage.removeItem('isLoggedIn'); 
        localStorage.removeItem('userRole');
        
        // Then set new auth state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', role);
        
        // Force a storage event for cross-tab communication
        window.dispatchEvent(new Event('storage'));
        
        // Delay redirect slightly to ensure state is saved
        setTimeout(() => {
          // Redirect based on role
          if (role === 'customer') {
            navigate('/dashboard/search');
          } else {
            navigate('/dashboard/admin');
          }
        }, 100);
      }
    }
  };

  const toggleForm = () => {
    navigate(isLoginForm ? '/signup' : '/login');
    setIsLoginForm(!isLoginForm);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLoginForm ? 'Sign in to Medilocate' : 'Create your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLoginForm ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={toggleForm}
            className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150"
          >
            {isLoginForm ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                I am a
              </label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div className={`flex items-center border rounded-md p-3 ${role === 'customer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                  <input
                    id="customer"
                    name="role"
                    type="radio"
                    value="customer"
                    checked={role === 'customer'}
                    onChange={handleRoleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="customer" className="ml-3 block text-sm font-medium text-gray-700">
                    Customer
                  </label>
                </div>
                <div className={`flex items-center border rounded-md p-3 ${role === 'seller' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                  <input
                    id="seller"
                    name="role"
                    type="radio"
                    value="seller"
                    checked={role === 'seller'}
                    onChange={handleRoleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="seller" className="ml-3 block text-sm font-medium text-gray-700">
                    Medical Shop Owner
                  </label>
                </div>
              </div>
            </div>

            {/* Full Name Field - Only for Signup */}
            {!isLoginForm && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.fullName ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                  {errors.fullName && (
                    <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Confirm Password Field - Only for Signup */}
            {!isLoginForm && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            )}

            {/* Customer Location Field - Only for Customer Signup */}
            {!isLoginForm && role === 'customer' && (
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Your Location
                </label>
                <div className="mt-1">
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.location ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                  {errors.location && (
                    <p className="mt-2 text-sm text-red-600">{errors.location}</p>
                  )}
                </div>
              </div>
            )}

            {/* Shop Fields - Only for Seller Signup */}
            {!isLoginForm && role === 'seller' && (
              <>
                <div>
                  <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
                    Shop Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="shopName"
                      name="shopName"
                      type="text"
                      value={formData.shopName}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.shopName ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.shopName && (
                      <p className="mt-2 text-sm text-red-600">{errors.shopName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="shopLicense" className="block text-sm font-medium text-gray-700">
                    Shop License/Number
                  </label>
                  <div className="mt-1">
                    <input
                      id="shopLicense"
                      name="shopLicense"
                      type="text"
                      value={formData.shopLicense}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.shopLicense ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.shopLicense && (
                      <p className="mt-2 text-sm text-red-600">{errors.shopLicense}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="shopAddress" className="block text-sm font-medium text-gray-700">
                    Shop Address
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="shopAddress"
                      name="shopAddress"
                      rows="3"
                      value={formData.shopAddress}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.shopAddress ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    ></textarea>
                    {errors.shopAddress && (
                      <p className="mt-2 text-sm text-red-600">{errors.shopAddress}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="shopLocation" className="block text-sm font-medium text-gray-700">
                    Shop Location (for map)
                  </label>
                  <div className="mt-1">
                    <input
                      id="shopLocation"
                      name="shopLocation"
                      type="text"
                      placeholder="e.g., latitude, longitude or area name"
                      value={formData.shopLocation}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.shopLocation ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.shopLocation && (
                      <p className="mt-2 text-sm text-red-600">{errors.shopLocation}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoginForm ? 'Sign in' : 'Sign up'}
              </button>
            </div>
          </form>

          {/* Demo instructions */}
          {isLoginForm && (
            <div className="mt-4 text-sm text-center text-gray-500">
              <p>For demo: Enter any email and password</p>
            </div>
          )}

          {/* Forgot Password Link - Only for Login */}
          {isLoginForm && (
            <div className="mt-6">
              <div className="relative">
                <div className="relative flex justify-center text-sm">
                  <span className="text-gray-500">
                    <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                      Forgot your password?
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginSignupPage; 