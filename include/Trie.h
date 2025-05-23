#ifndef TRIE_H
#define TRIE_H

#include <string>
#include <vector>
#include <map>

/**
 * @brief Node structure for Trie (prefix tree).
 */
class TrieNode {
public:
    /// Indicates whether this node marks the end of a word.
    bool isEndOfWord;
    /// Children nodes stored in sorted order by character.
    std::map<char, TrieNode*> children;

    TrieNode();
};

/**
 * @brief Trie (prefix tree) for efficient string insertion and prefix search.
 */
class Trie {
private:
    TrieNode* root;  ///< Root node of the Trie.

    /// Recursively deletes all nodes in the given subtree.
    void deleteSubtree(TrieNode* node);

    /// Recursively collects all words under the given node.
    void dfs(TrieNode* node, const std::string& prefix, std::vector<std::string>& results) const;

public:
    /// Constructor: initializes the root node.
    Trie();

    /// Destructor: frees all allocated nodes.
    ~Trie();

    /**
     * @brief Insert a word into the Trie (stored in lowercase).
     * @param word The string to insert.
     */
    void insert(const std::string& word);

    /**
     * @brief Search for an exact word in the Trie.
     * @param word The word to search for.
     * @return True if the word exists, false otherwise.
     */
    bool search(const std::string& word) const;

    /**
     * @brief Find all words in the Trie that start with the given prefix.
     * @param prefix The prefix string to search for.
     * @return Vector of matching words (empty if none found).
     */
    std::vector<std::string> startsWith(const std::string& prefix) const;
};

#endif // TRIE_H 