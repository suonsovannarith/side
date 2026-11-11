#ifndef CONTENT_SLL_H
#define CONTENT_SLL_H

#include "../models/ContentItem.h"
#include <iostream>
#include <string>
#include <vector>

struct ContentNode {
    ContentItem data;
    ContentNode* next;

    ContentNode(const ContentItem& item) : data(item), next(nullptr) {}
};

class ContentSLL {
private:
    ContentNode* head;
    int count;

public:
    ContentSLL() : head(nullptr), count(0) {}

    ~ContentSLL() {
        clear();
    }

    // Rule of 5: Deep Copy Constructor
    ContentSLL(const ContentSLL& other) : head(nullptr), count(0) {
        ContentNode* curr = other.head;
        while (curr != nullptr) {
            append(curr->data);
            curr = curr->next;
        }
    }

    // Rule of 5: Deep Copy Assignment Operator
    ContentSLL& operator=(const ContentSLL& other) {
        if (this != &other) {
            clear();
            ContentNode* curr = other.head;
            while (curr != nullptr) {
                append(curr->data);
                curr = curr->next;
            }
        }
        return *this;
    }

    // Rule of 5: Move Constructor
    ContentSLL(ContentSLL&& other) noexcept : head(other.head), count(other.count) {
        other.head = nullptr;
        other.count = 0;
    }

    // Rule of 5: Move Assignment Operator
    ContentSLL& operator=(ContentSLL&& other) noexcept {
        if (this != &other) {
            clear();
            head = other.head;
            count = other.count;
            other.head = nullptr;
            other.count = 0;
        }
        return *this;
    }

    void clear() {
        ContentNode* current = head;
        while (current != nullptr) {
            ContentNode* nextNode = current->next;
            delete current;
            current = nextNode;
        }
        head = nullptr;
        count = 0;
    }

    // Prepend O(1)
    void prepend(const ContentItem& item) {
        ContentNode* newNode = new ContentNode(item);
        newNode->next = head;
        head = newNode;
        count++;
    }

    // Append O(n)
    void append(const ContentItem& item) {
        ContentNode* newNode = new ContentNode(item);
        if (head == nullptr) {
            head = newNode;
        } else {
            ContentNode* curr = head;
            while (curr->next != nullptr) {
                curr = curr->next;
            }
            curr->next = newNode;
        }
        count++;
    }

    // Delete by ID
    bool deleteById(const std::string& id) {
        if (head == nullptr) return false;

        if (head->data.getId() == id) {
            ContentNode* temp = head;
            head = head->next;
            delete temp;
            count--;
            return true;
        }

        ContentNode* curr = head;
        while (curr->next != nullptr && curr->next->data.getId() != id) {
            curr = curr->next;
        }

        if (curr->next != nullptr) {
            ContentNode* temp = curr->next;
            curr->next = curr->next->next;
            delete temp;
            count--;
            return true;
        }
        return false;
    }

    // Linear Search by ID
    ContentNode* searchById(const std::string& id) const {
        ContentNode* curr = head;
        while (curr != nullptr) {
            if (curr->data.getId() == id) return curr;
            curr = curr->next;
        }
        return nullptr;
    }

    std::vector<ContentItem> toVector() const {
        std::vector<ContentItem> result;
        ContentNode* curr = head;
        while (curr != nullptr) {
            result.push_back(curr->data);
            curr = curr->next;
        }
        return result;
    }

    int size() const { return count; }
    bool isEmpty() const { return head == nullptr; }
    ContentNode* getHead() const { return head; }
};

#endif // CONTENT_SLL_H
