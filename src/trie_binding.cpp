#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include "../include/Trie.h"

namespace py = pybind11;

PYBIND11_MODULE(medilocate, m) {
    m.doc() = "Medicine name search with Trie";
    
    py::class_<Trie>(m, "Trie")
        .def(py::init<>())
        .def("insert", &Trie::insert)
        .def("search", &Trie::search)
        .def("startsWith", &Trie::startsWith);
} 