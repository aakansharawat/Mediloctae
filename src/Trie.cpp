#include "../include/Trie.h"

// Constructor: initialize the root node
TrieNode::TrieNode() : isEndOfWord(false) {}

// Constructor: initialize the root node
Trie::Trie() {
    root = new TrieNode();
}

// Destructor: free all allocated nodes
Trie::~Trie() {
    deleteSubtree(root);
}

// Recursively delete all nodes in the given subtree
void Trie::deleteSubtree(TrieNode* node) {
    if (!node) return;
    
    // Delete all children first
    for (auto& pair : node->children) {
        deleteSubtree(pair.second);
    }
    
    // Then delete this node
    delete node;
}

// Insert a word into the trie
void Trie::insert(const std::string& word) {
    TrieNode* current = root;
    
    // Convert to lowercase and insert each character
    for (char c : word) {
        c = std::tolower(c);
        if (current->children.find(c) == current->children.end()) {
            current->children[c] = new TrieNode();
        }
        current = current->children[c];
    }
    
    // Mark the end of the word
    current->isEndOfWord = true;
}

// Search for an exact word in the trie
bool Trie::search(const std::string& word) const {
    TrieNode* node = root;
    
    // Convert to lowercase and search each character
    for (char c : word) {
        c = std::tolower(c);
        if (node->children.find(c) == node->children.end()) {
            return false;
        }
        node = node->children[c];
    }
    
    // Return true only if this is the end of a word
    return node->isEndOfWord;
}

// Find all words in the trie that start with the given prefix
std::vector<std::string> Trie::startsWith(const std::string& prefix) const {
    std::vector<std::string> results;
    TrieNode* node = root;
    
    // Convert prefix to lowercase and find the node
    std::string lowerPrefix = prefix;
    for (char& c : lowerPrefix) {
        c = std::tolower(c);
    }
    
    // Traverse to the end of the prefix
    for (char c : lowerPrefix) {
        if (node->children.find(c) == node->children.end()) {
            return results; // Prefix not found
        }
        node = node->children[c];
    }
    
    // Collect all words under this prefix using DFS
    dfs(node, lowerPrefix, results);
    return results;
}

// Recursively collect all words under the given node
void Trie::dfs(TrieNode* node, const std::string& prefix, std::vector<std::string>& results) const {
    if (!node) return;
    
    // If this is a complete word, add it to results
    if (node->isEndOfWord) {
        results.push_back(prefix);
    }
    
    // Visit all children in sorted order
    for (const auto& pair : node->children) {
        dfs(pair.second, prefix + pair.first, results);
    }
} 