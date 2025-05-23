# Medilocate Python API

This Flask API connects to the C++ Trie implementation using pybind11, providing a REST interface for searching medicine names.

## Setup Instructions

### Prerequisites

- CMake (3.10+)
- C++ compiler with C++17 support
- Python 3.6+
- pip (Python package manager)

### Build Steps

1. First, build the C++ library with pybind11 bindings:

```bash
# From the root of the project (where CMakeLists.txt is located)
mkdir -p build
cd build
cmake ..
cmake --build . --config Release
```

This will create the Python module (`medilocate.[so/pyd]`) in the `python_api` directory.

2. Set up Python virtual environment and install dependencies:

```bash
# From the project root
cd python_api
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Running the API

Start the Flask server:

```bash
# Make sure you're in the python_api directory with the venv activated
python app.py
```

The API will be available at http://localhost:5000.

## API Endpoints

### Search Medicines

```
GET /search?query=<search_term>
```

This endpoint searches for medicines by name. For queries with 1-2 characters, it returns all medicines with that prefix. For 3+ characters, it tries an exact match first, then falls back to prefix search.

Response format:
```json
{
  "query": "string",
  "results": ["string", "string", ...],
  "count": 0,
  "search_type": "exact|prefix"
}
```

### Add Medicine

```
POST /add
Content-Type: application/json

{
  "medicine": "medicine_name"
}
```

This endpoint adds a new medicine name to the in-memory Trie.

Response format:
```json
{
  "status": "success",
  "message": "Added medicine_name to the medicine database"
}
```

### Health Check

```
GET /health
```

Returns the status of the API and the count of loaded medicines.

Response format:
```json
{
  "status": "healthy",
  "medicines_count": 0
}
``` 