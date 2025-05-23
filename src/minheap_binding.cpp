#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include "../include/MinHeap.h"

namespace py = pybind11;

// Create a module for MinHeap functionality
PYBIND11_MODULE(expiry_heap, m) {
    m.doc() = "Medicine expiry tracking with MinHeap"; // Module docstring
    
    // Expose MedicineItem struct
    py::class_<MedicineItem>(m, "MedicineItem")
        .def(py::init<>())
        .def_readwrite("id", &MedicineItem::id)
        .def_readwrite("name", &MedicineItem::name)
        .def_readwrite("brand", &MedicineItem::brand)
        .def_readwrite("quantity", &MedicineItem::quantity)
        .def_readwrite("expiryDate", &MedicineItem::expiryDate)
        .def("getExpiryTime", &MedicineItem::getExpiryTime);
    
    // Expose MinHeap class
    py::class_<MinHeap>(m, "MinHeap")
        .def(py::init<>())
        .def("insert", &MinHeap::insert)
        .def("extractMin", &MinHeap::extractMin)
        .def("peek", &MinHeap::peek)
        .def("getSortedItems", &MinHeap::getSortedItems)
        .def("isEmpty", &MinHeap::isEmpty)
        .def("size", &MinHeap::size)
        .def("clear", &MinHeap::clear);
} 