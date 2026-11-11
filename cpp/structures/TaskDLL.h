#ifndef TASK_DLL_H
#define TASK_DLL_H

#include "../models/Task.h"
#include <iostream>
#include <string>
#include <vector>

struct TaskNode {
    Task data;
    TaskNode* prev;
    TaskNode* next;

    TaskNode(const Task& t) : data(t), prev(nullptr), next(nullptr) {}
};

class TaskDLL {
private:
    TaskNode* head;
    TaskNode* tail;
    int count;

public:
    TaskDLL() : head(nullptr), tail(nullptr), count(0) {}

    ~TaskDLL() {
        clear();
    }

    // Rule of 5: Deep Copy Constructor (Eliminates shallow copy double-free hazard)
    TaskDLL(const TaskDLL& other) : head(nullptr), tail(nullptr), count(0) {
        TaskNode* curr = other.head;
        while (curr != nullptr) {
            append(curr->data);
            curr = curr->next;
        }
    }

    // Rule of 5: Deep Copy Assignment Operator
    TaskDLL& operator=(const TaskDLL& other) {
        if (this != &other) {
            clear();
            TaskNode* curr = other.head;
            while (curr != nullptr) {
                append(curr->data);
                curr = curr->next;
            }
        }
        return *this;
    }

    // Rule of 5: Move Constructor
    TaskDLL(TaskDLL&& other) noexcept : head(other.head), tail(other.tail), count(other.count) {
        other.head = nullptr;
        other.tail = nullptr;
        other.count = 0;
    }

    // Rule of 5: Move Assignment Operator
    TaskDLL& operator=(TaskDLL&& other) noexcept {
        if (this != &other) {
            clear();
            head = other.head;
            tail = other.tail;
            count = other.count;
            other.head = nullptr;
            other.tail = nullptr;
            other.count = 0;
        }
        return *this;
    }

    void clear() {
        TaskNode* current = head;
        while (current != nullptr) {
            TaskNode* nextNode = current->next;
            delete current;
            current = nextNode;
        }
        head = nullptr;
        tail = nullptr;
        count = 0;
    }

    // Append to tail in O(1) using tail pointer
    void append(const Task& t) {
        TaskNode* newNode = new TaskNode(t);
        if (head == nullptr) {
            head = tail = newNode;
        } else {
            newNode->prev = tail;
            tail->next = newNode;
            tail = newNode;
        }
        count++;
    }

    // Prepend to head in O(1)
    void prepend(const Task& t) {
        TaskNode* newNode = new TaskNode(t);
        if (head == nullptr) {
            head = tail = newNode;
        } else {
            newNode->next = head;
            head->prev = newNode;
            head = newNode;
        }
        count++;
    }

    // Remove a node with verified bidirectional pointer re-linking
    bool removeById(const std::string& taskId) {
        TaskNode* current = head;
        while (current != nullptr) {
            if (current->data.getId() == taskId) {
                if (current->prev != nullptr)
                    current->prev->next = current->next;
                else
                    head = current->next;

                if (current->next != nullptr)
                    current->next->prev = current->prev;
                else
                    tail = current->prev;

                delete current;
                count--;
                return true;
            }
            current = current->next;
        }
        return false;
    }

    // Find task by ID
    TaskNode* findById(const std::string& taskId) const {
        TaskNode* curr = head;
        while (curr != nullptr) {
            if (curr->data.getId() == taskId) return curr;
            curr = curr->next;
        }
        return nullptr;
    }

    // Traverse Forward
    void displayForward() const {
        TaskNode* curr = head;
        while (curr != nullptr) {
            std::cout << curr->data.serialize() << " <-> ";
            curr = curr->next;
        }
        std::cout << "NULL\n";
    }

    // Traverse Backward
    void displayReverse() const {
        TaskNode* curr = tail;
        while (curr != nullptr) {
            std::cout << curr->data.serialize() << " <-> ";
            curr = curr->prev;
        }
        std::cout << "NULL\n";
    }

    std::vector<Task> toVector() const {
        std::vector<Task> result;
        TaskNode* curr = head;
        while (curr != nullptr) {
            result.push_back(curr->data);
            curr = curr->next;
        }
        return result;
    }

    int size() const { return count; }
    bool isEmpty() const { return head == nullptr; }
    TaskNode* getHead() const { return head; }
    TaskNode* getTail() const { return tail; }
};

#endif // TASK_DLL_H
