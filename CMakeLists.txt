cmake_minimum_required(VERSION 3.10)
project(medilocate_backend)

# Use C++17 standard.
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Find Python
find_package(Python COMPONENTS Interpreter Development REQUIRED)

# Add pybind11
include(FetchContent)
FetchContent_Declare(
    pybind11
    GIT_REPOSITORY https://github.com/pybind/pybind11.git
    GIT_TAG        v2.11.1
)
FetchContent_MakeAvailable(pybind11)

# Main executable for demonstration.
add_executable(medilocate_main
    src/main.cpp
    src/Trie.cpp
    src/MinHeap.cpp
)
target_include_directories(medilocate_main PRIVATE ${PROJECT_SOURCE_DIR}/include)

# Test executable for running assertions.
add_executable(trie_test
    tests/trie_tests.cpp
    src/Trie.cpp
)
target_include_directories(trie_test PRIVATE ${PROJECT_SOURCE_DIR}/include)

# Python module for Trie
pybind11_add_module(medilocate src/trie_binding.cpp src/Trie.cpp)
target_include_directories(medilocate PRIVATE ${PROJECT_SOURCE_DIR}/include)
set_target_properties(medilocate PROPERTIES
    OUTPUT_NAME medilocate
    LIBRARY_OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/python_api
)

# Python module for MinHeap expiry tracking
pybind11_add_module(expiry_heap src/minheap_binding.cpp src/MinHeap.cpp)
target_include_directories(expiry_heap PRIVATE ${PROJECT_SOURCE_DIR}/include)
set_target_properties(expiry_heap PROPERTIES
    OUTPUT_NAME expiry_heap
    LIBRARY_OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/python_api
) 