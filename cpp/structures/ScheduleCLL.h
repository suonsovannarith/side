#ifndef SCHEDULE_CLL_H
#define SCHEDULE_CLL_H

#include "../models/Channel.h"
#include <iostream>
#include <string>
#include <vector>

struct ScheduleNode {
    Channel data;
    ScheduleNode* next;

    ScheduleNode(const Channel& ch) : data(ch), next(nullptr) {}
};

class ScheduleCLL {
private:
    ScheduleNode* head;
    ScheduleNode* tail;
    ScheduleNode* current;
    int count;

public:
    ScheduleCLL() : head(nullptr), tail(nullptr), current(nullptr), count(0) {}

    ~ScheduleCLL() {
        clear();
    }

    // Rule of 5: Deep Copy Constructor
    ScheduleCLL(const ScheduleCLL& other) : head(nullptr), tail(nullptr), current(nullptr), count(0) {
        if (other.head == nullptr) return;
        ScheduleNode* curr = other.head;
        do {
            append(curr->data);
            curr = curr->next;
        } while (curr != other.head);
    }

    // Rule of 5: Deep Copy Assignment Operator
    ScheduleCLL& operator=(const ScheduleCLL& other) {
        if (this != &other) {
            clear();
            if (other.head != nullptr) {
                ScheduleNode* curr = other.head;
                do {
                    append(curr->data);
                    curr = curr->next;
                } while (curr != other.head);
            }
        }
        return *this;
    }

    // Rule of 5: Move Constructor
    ScheduleCLL(ScheduleCLL&& other) noexcept
        : head(other.head), tail(other.tail), current(other.current), count(other.count) {
        other.head = nullptr;
        other.tail = nullptr;
        other.current = nullptr;
        other.count = 0;
    }

    // Rule of 5: Move Assignment Operator
    ScheduleCLL& operator=(ScheduleCLL&& other) noexcept {
        if (this != &other) {
            clear();
            head = other.head;
            tail = other.tail;
            current = other.current;
            count = other.count;
            other.head = nullptr;
            other.tail = nullptr;
            other.current = nullptr;
            other.count = 0;
        }
        return *this;
    }

    void clear() {
        if (head == nullptr) return;

        ScheduleNode* curr = head;
        tail->next = nullptr; // Break cycle so we can delete linearly
        while (curr != nullptr) {
            ScheduleNode* nextNode = curr->next;
            delete curr;
            curr = nextNode;
        }
        head = nullptr;
        tail = nullptr;
        current = nullptr;
        count = 0;
    }

    // Append maintaining circular link (tail->next = head)
    void append(const Channel& ch) {
        ScheduleNode* newNode = new ScheduleNode(ch);
        if (head == nullptr) {
            head = tail = current = newNode;
            newNode->next = head;
        } else {
            newNode->next = head;
            tail->next = newNode;
            tail = newNode;
        }
        count++;
    }

    // Advance live rotation pointer to next active channel
    Channel advance() {
        if (current == nullptr) return Channel();
        current = current->next;
        return current->data;
    }

    ScheduleNode* getCurrent() const { return current; }
    ScheduleNode* getHead() const { return head; }
    int size() const { return count; }
    bool isEmpty() const { return head == nullptr; }
};

#endif // SCHEDULE_CLL_H
