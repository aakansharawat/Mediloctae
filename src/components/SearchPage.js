import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultCount, setResultCount] = useState(0);
  const [searchType, setSearchType] = useState('');
  const [searchFeedback, setSearchFeedback] = useState('Type at least 1 character to see results');
  const [showResults, setShowResults] = useState(false);

  const performSearch = async () => {
    if (query.trim() === '') {
      setShowResults(false);
      setSearchFeedback('Type at least 1 character to see results');
      return;
    }

    setIsLoading(true);
    setError('');
    setSearchFeedback('Searching...');

    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: { query: query.trim() }
      });

      setResults(response.data.results);
      setResultCount(response.data.count);
      setSearchType(response.data.search_type);
      
      if (response.data.count === 0) {
        setSearchFeedback(`No results found for "${query}"`);
      } else {
        setSearchFeedback(`${response.data.count} result(s) found for "${query}"`);
      }
      
      setShowResults(true);
    } catch (err) {
      setError('Error searching for medicines. Please try again.');
      setSearchFeedback(`Error searching for "${query}"`);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Search when user types (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 1) {
        performSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const handleMedicineClick = (medicine) => {
    setQuery(medicine);
  };

  return (
    <div>
      <div className="row justify-content-center">
        <div className="col-md-8 text-center mb-4">
          <h1 className="display-4 mb-4">
            <i className="fas fa-pills text-primary me-3"></i>Medilocate
          </h1>
          <p className="lead mb-5">Search for medicines in our comprehensive database with real-time suggestions.</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="search-container">
                <div className="input-group mb-3">
                  <span className="input-group-text bg-primary text-white">
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    id="search-input"
                    className="form-control form-control-lg"
                    placeholder="Start typing a medicine name..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                  <button
                    id="search-button"
                    className="btn btn-primary"
                    onClick={performSearch}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><i className="fas fa-spinner fa-spin me-1"></i> Searching</>
                    ) : (
                      'Search'
                    )}
                  </button>
                </div>
                <div id="search-feedback" className="text-muted small mb-2">
                  {isLoading ? (
                    <><i className="fas fa-spinner fa-spin me-1"></i> Searching...</>
                  ) : (
                    searchFeedback
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showResults && (
        <div className="row justify-content-center mt-4">
          <div className="col-md-8">
            <div id="results-container" className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-list me-2"></i>Search Results
                  <span id="result-count" className="badge bg-light text-primary float-end">
                    {resultCount}
                  </span>
                </h5>
              </div>
              <div className="card-body">
                {resultCount > 0 ? (
                  <div id="results-list" className="list-group">
                    {results.map((medicine, index) => (
                      <a
                        key={index}
                        href="#"
                        className="list-group-item list-group-item-action"
                        onClick={(e) => {
                          e.preventDefault();
                          handleMedicineClick(medicine);
                        }}
                      >
                        <i className="fas fa-capsules me-2 text-primary"></i>
                        {medicine}
                      </a>
                    ))}
                  </div>
                ) : (
                  <div id="no-results" className="alert alert-info mt-3">
                    <i className="fas fa-info-circle me-2"></i>No medicines found matching your search.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage; 