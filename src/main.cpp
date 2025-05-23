#include <iostream>
#include <string>
#include <vector>
#include "../include/Trie.h"
#include "../include/MinHeap.h"

void test_trie() {
    std::cout << "Testing Trie..." << std::endl;
    
    // Create a Trie and insert some words
    Trie trie;
    trie.insert("apple");
    trie.insert("banana");
    trie.insert("application");
    trie.insert("appetizer");
    
    // Test search
    std::cout << "Search for 'apple': " << (trie.search("apple") ? "Found" : "Not found") << std::endl;
    std::cout << "Search for 'orange': " << (trie.search("orange") ? "Found" : "Not found") << std::endl;
    
    // Test startsWith
    std::cout << "Words starting with 'app':" << std::endl;
    auto results = trie.startsWith("app");
    for (const auto& word : results) {
        std::cout << "  - " << word << std::endl;
    }
}

void test_minheap() {
    std::cout << "\nTesting MinHeap..." << std::endl;
    
    // Create a MinHeap for medicine expiry tracking
    MinHeap heap;
    
    // Add some medicines with expiry dates
    MedicineItem med1;
    med1.id = 1;
    med1.name = "Aspirin";
    med1.brand = "Bayer";
    med1.quantity = 100;
    med1.expiryDate = "2024-06-30";
    
    MedicineItem med2;
    med2.id = 2;
    med2.name = "Ibuprofen";
    med2.brand = "Advil";
    med2.quantity = 50;
    med2.expiryDate = "2023-12-10";
    
    MedicineItem med3;
    med3.id = 3;
    med3.name = "Paracetamol";
    med3.brand = "Tylenol";
    med3.quantity = 75;
    med3.expiryDate = "2024-01-15";
    
    // Insert into the heap
    heap.insert(med1);
    heap.insert(med2);
    heap.insert(med3);
    
    // Get sorted items by expiry date
    std::cout << "Medicines sorted by expiry date (earliest first):" << std::endl;
    auto sorted = heap.getSortedItems();
    for (const auto& med : sorted) {
        std::cout << "  - " << med.name << " (" << med.brand << ") expires on " << med.expiryDate << std::endl;
    }
    
    // Extract items one by one
    std::cout << "\nExtracting medicines by expiry date:" << std::endl;
    while (!heap.isEmpty()) {
        auto med = heap.extractMin();
        std::cout << "  - " << med.name << " (" << med.brand << ") expires on " << med.expiryDate << std::endl;
    }
}

int main() {
    std::cout << "Medilocate Backend Tests" << std::endl;
    std::cout << "=======================" << std::endl;
    
    test_trie();
    test_minheap();
    
    return 0;
} 