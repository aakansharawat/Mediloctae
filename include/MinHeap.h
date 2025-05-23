#ifndef MINHEAP_H
#define MINHEAP_H

#include <vector>
#include <string>
#include <algorithm>
#include <functional>
#include <ctime>
#include <stdexcept>

/**
 * @brief A medicine item with expiry information.
 */
struct MedicineItem {
    int id;                 ///< Unique identifier
    std::string name;       ///< Medicine name 
    std::string brand;      ///< Brand name
    int quantity;           ///< Available quantity
    std::string expiryDate; ///< Expiry date in format YYYY-MM-DD
    
    // Convert expiry date string to time_t for comparison
    time_t getExpiryTime() const {
        struct tm tm = {0};
        // Parse YYYY-MM-DD format
        sscanf(expiryDate.c_str(), "%d-%d-%d", &tm.tm_year, &tm.tm_mon, &tm.tm_mday);
        tm.tm_year -= 1900;  // Years since 1900
        tm.tm_mon -= 1;      // Months are 0-based
        return mktime(&tm);
    }
};

/**
 * @brief MinHeap implementation for medicine items ordered by expiry date.
 */
class MinHeap {
private:
    std::vector<MedicineItem> heap;
    
    // Helper method to maintain heap property after insertion
    void heapifyUp(int index) {
        int parent = (index - 1) / 2;
        
        // If current node is smaller than its parent, swap and continue upward
        if (index > 0 && heap[index].getExpiryTime() < heap[parent].getExpiryTime()) {
            std::swap(heap[index], heap[parent]);
            heapifyUp(parent);
        }
    }
    
    // Helper method to maintain heap property after removal
    void heapifyDown(int index) {
        int smallest = index;
        int left = 2 * index + 1;
        int right = 2 * index + 2;
        
        // Find smallest among current, left and right children
        if (left < heap.size() && heap[left].getExpiryTime() < heap[smallest].getExpiryTime()) {
            smallest = left;
        }
        
        if (right < heap.size() && heap[right].getExpiryTime() < heap[smallest].getExpiryTime()) {
            smallest = right;
        }
        
        // If smallest is not the current node, swap and continue downward
        if (smallest != index) {
            std::swap(heap[index], heap[smallest]);
            heapifyDown(smallest);
        }
    }
    
public:
    /**
     * @brief Add a medicine item to the heap.
     * @param item The medicine item to add.
     */
    void insert(const MedicineItem& item) {
        heap.push_back(item);
        heapifyUp(heap.size() - 1);
    }
    
    /**
     * @brief Extract the medicine with the earliest expiry date.
     * @return The medicine item with the earliest expiry date.
     */
    MedicineItem extractMin() {
        if (heap.empty()) {
            throw std::runtime_error("Heap is empty");
        }
        
        MedicineItem minItem = heap[0];
        heap[0] = heap.back();
        heap.pop_back();
        
        if (!heap.empty()) {
            heapifyDown(0);
        }
        
        return minItem;
    }
    
    /**
     * @brief Get the medicine with the earliest expiry date without removing it.
     * @return The medicine item with the earliest expiry date.
     */
    MedicineItem peek() const {
        if (heap.empty()) {
            throw std::runtime_error("Heap is empty");
        }
        return heap[0];
    }
    
    /**
     * @brief Get all medicines in the heap, sorted by expiry date (earliest first).
     * @return Vector of medicine items sorted by expiry date.
     */
    std::vector<MedicineItem> getSortedItems() const {
        std::vector<MedicineItem> sortedItems = heap;
        
        // Sort by expiry date
        std::sort(sortedItems.begin(), sortedItems.end(), 
            [](const MedicineItem& a, const MedicineItem& b) {
                return a.getExpiryTime() < b.getExpiryTime();
            });
            
        return sortedItems;
    }
    
    /**
     * @brief Check if the heap is empty.
     * @return True if empty, false otherwise.
     */
    bool isEmpty() const {
        return heap.empty();
    }
    
    /**
     * @brief Get the number of items in the heap.
     * @return Size of the heap.
     */
    size_t size() const {
        return heap.size();
    }
    
    /**
     * @brief Clear all items from the heap.
     */
    void clear() {
        heap.clear();
    }
};

#endif // MINHEAP_H 