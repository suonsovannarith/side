export interface CppSourceFile {
  path: string;
  folder: 'root' | 'models' | 'structures' | 'managers' | 'report';
  title: string;
  description: string;
  concepts: string[];
  code: string;
}

export const CPP_SOURCE_FILES: CppSourceFile[] = [
  {
    path: 'models/Channel.h',
    folder: 'models',
    title: 'Channel.h — Encapsulated Channel Profile Model',
    description: 'Defines the Channel class with private data members, overloaded constructors, and overloaded display/update methods.',
    concepts: ['Encapsulation', 'Constructor Overloading', 'Method Overloading'],
    code: `#ifndef CHANNEL_H
#define CHANNEL_H

#include <string>
#include <iostream>
#include <sstream>

class Channel {
private:
    std::string channelId;
    std::string name;
    std::string category;
    std::string description;
    std::string lastUploadedDate;
    bool activeInRotation;

public:
    // 1. Default Constructor (Overloaded Constructor #1)
    Channel()
        : channelId("CH-00"), name("Untitled Channel"), category("General"),
          description(""), lastUploadedDate("N/A"), activeInRotation(true) {}

    // 2. Basic Constructor (Overloaded Constructor #2)
    Channel(const std::string& id, const std::string& name, const std::string& category)
        : channelId(id), name(name), category(category),
          description("Standard channel profile"), lastUploadedDate("Not uploaded yet"),
          activeInRotation(true) {}

    // 3. Full Parameterized Constructor (Overloaded Constructor #3)
    Channel(const std::string& id, const std::string& name, const std::string& category,
            const std::string& desc, const std::string& lastUpload, bool active = true)
        : channelId(id), name(name), category(category),
          description(desc), lastUploadedDate(lastUpload), activeInRotation(active) {}

    // Encapsulated Getters
    std::string getId() const { return channelId; }
    std::string getName() const { return name; }
    std::string getCategory() const { return category; }
    std::string getDescription() const { return description; }
    std::string getLastUploadedDate() const { return lastUploadedDate; }
    bool isActiveInRotation() const { return activeInRotation; }

    // Encapsulated Setters
    void setName(const std::string& n) { name = n; }
    void setCategory(const std::string& c) { category = c; }
    void setDescription(const std::string& d) { description = d; }
    void setLastUploadedDate(const std::string& date) { lastUploadedDate = date; }
    void setActiveInRotation(bool active) { activeInRotation = active; }

    // Overloaded Method #1: Update channel name and category
    void updateProfile(const std::string& newName, const std::string& newCategory) {
        name = newName;
        category = newCategory;
    }

    // Overloaded Method #2: Update channel name, category, and description
    void updateProfile(const std::string& newName, const std::string& newCategory, const std::string& newDesc) {
        name = newName;
        category = newCategory;
        description = newDesc;
    }

    // Serialize for channels.txt
    std::string serialize() const {
        std::ostringstream oss;
        oss << channelId << "|" << name << "|" << category << "|"
            << lastUploadedDate << "|" << (activeInRotation ? "1" : "0") << "|" << description;
        return oss.str();
    }

    void printSummary() const {
        std::cout << "[" << channelId << "] " << name
                  << " (" << category << ") - Last Upload: " << lastUploadedDate << "\\n";
    }
};

#endif // CHANNEL_H`,
  },
  {
    path: 'models/ContentItem.h',
    folder: 'models',
    title: 'ContentItem.h — Video Content Idea Entity',
    description: 'Stores Content ID, Video Title, Channel ID, Content Type, Priority, Production Status, Planned Publishing Date, and Script/Asset File Path.',
    concepts: ['OOP Class & Object', 'Constructor Overloading', 'Method Overloading', 'Encapsulation'],
    code: `#ifndef CONTENT_ITEM_H
#define CONTENT_ITEM_H

#include <string>
#include <iostream>
#include <sstream>

class ContentItem {
private:
    std::string contentId;
    std::string title;
    std::string channelId;
    std::string contentType;       // "Short-form" or "Long-form"
    std::string priority;          // "High", "Medium", "Low"
    std::string productionStatus;  // "Idea", "In Production", "Ready to Publish", "Published"
    std::string plannedPublishDate;
    std::string assetFilePath;

public:
    // Overloaded Constructor #1: Default
    ContentItem()
        : contentId("CNT-000"), title("Untitled Idea"), channelId("CH-01"),
          contentType("Short-form"), priority("Medium"), productionStatus("Idea"),
          plannedPublishDate("2026-03-01"), assetFilePath("/data/assets/draft.md") {}

    // Overloaded Constructor #2: Quick Idea Capture
    ContentItem(const std::string& id, const std::string& title, const std::string& chId)
        : contentId(id), title(title), channelId(chId),
          contentType("Short-form"), priority("Medium"), productionStatus("Idea"),
          plannedPublishDate("2026-03-15"), assetFilePath("/data/assets/" + id + ".md") {}

    // Overloaded Constructor #3: Complete Content Record
    ContentItem(const std::string& id, const std::string& title, const std::string& chId,
                const std::string& type, const std::string& prio, const std::string& status,
                const std::string& pubDate, const std::string& path)
        : contentId(id), title(title), channelId(chId), contentType(type),
          priority(prio), productionStatus(status), plannedPublishDate(pubDate),
          assetFilePath(path) {}

    // Getters
    std::string getId() const { return contentId; }
    std::string getTitle() const { return title; }
    std::string getChannelId() const { return channelId; }
    std::string getType() const { return contentType; }
    std::string getPriority() const { return priority; }
    std::string getStatus() const { return productionStatus; }
    std::string getPlannedPublishDate() const { return plannedPublishDate; }
    std::string getAssetFilePath() const { return assetFilePath; }

    // Setters
    void setTitle(const std::string& t) { title = t; }
    void setChannelId(const std::string& c) { channelId = c; }
    void setType(const std::string& t) { contentType = t; }
    void setPriority(const std::string& p) { priority = p; }
    void setStatus(const std::string& s) { productionStatus = s; }
    void setPlannedPublishDate(const std::string& d) { plannedPublishDate = d; }
    void setAssetFilePath(const std::string& p) { assetFilePath = p; }

    // Overloaded Method #1: Reschedule date only
    void reschedule(const std::string& newDate) {
        plannedPublishDate = newDate;
    }

    // Overloaded Method #2: Reschedule date and update priority
    void reschedule(const std::string& newDate, const std::string& newPriority) {
        plannedPublishDate = newDate;
        priority = newPriority;
    }

    std::string serialize() const {
        std::ostringstream oss;
        oss << contentId << "|" << title << "|" << channelId << "|"
            << contentType << "|" << priority << "|" << productionStatus << "|"
            << plannedPublishDate << "|" << assetFilePath;
        return oss.str();
    }
};

#endif // CONTENT_ITEM_H`,
  },
  {
    path: 'models/Task.h',
    folder: 'models',
    title: 'Task.h — 7-Stage Production Task Model',
    description: 'Models the 7 production steps from story research and scriptwriting to voiceover, visuals, editing, thumbnail, and publishing.',
    concepts: ['Encapsulation', '7-Stage Workflow', 'Constructor Overloading'],
    code: `#ifndef TASK_H
#define TASK_H

#include <string>
#include <sstream>

class Task {
private:
    std::string taskId;
    std::string contentId;
    int stageNumber;          // 1..7
    std::string stageName;    // e.g. "Research story concept", "Write script", etc.
    std::string status;       // "Pending", "In Progress", "Completed", "Blocked"
    std::string dueDate;
    std::string toolOrAssignee;

public:
    Task()
        : taskId("TSK-000"), contentId("CNT-000"), stageNumber(1),
          stageName("Research story concept"), status("Pending"),
          dueDate("2026-03-10"), toolOrAssignee("Creator") {}

    Task(const std::string& id, const std::string& cntId, int stageNum,
         const std::string& name, const std::string& stat,
         const std::string& due, const std::string& tool)
        : taskId(id), contentId(cntId), stageNumber(stageNum),
          stageName(name), status(stat), dueDate(due), toolOrAssignee(tool) {}

    std::string getId() const { return taskId; }
    std::string getContentId() const { return contentId; }
    int getStageNumber() const { return stageNumber; }
    std::string getStageName() const { return stageName; }
    std::string getStatus() const { return status; }
    std::string getDueDate() const { return dueDate; }
    std::string getToolOrAssignee() const { return toolOrAssignee; }

    void setStage(int num, const std::string& name) {
        stageNumber = num;
        stageName = name;
    }
    void setStatus(const std::string& s) { status = s; }
    void setDueDate(const std::string& d) { dueDate = d; }

    std::string serialize() const {
        std::ostringstream oss;
        oss << taskId << "|" << contentId << "|" << stageNumber << "|"
            << stageName << "|" << status << "|" << dueDate << "|" << toolOrAssignee;
        return oss.str();
    }
};

#endif // TASK_H`,
  },
  {
    path: 'structures/ContentSLL.h',
    folder: 'structures',
    title: 'ContentSLL.h — Manual Singly Linked List for Content Ideas',
    description: 'Implements a Singly Linked List (SLL) from scratch with dynamic memory management, sorted insertion, linear search (overloaded by ID or keyword), and node deletion.',
    concepts: ['Singly Linked List (SLL)', 'Manual Pointer Manipulation', 'Destructor Memory Cleanup', 'Method Overloading'],
    code: `#ifndef CONTENT_SLL_H
#define CONTENT_SLL_H

#include "../models/ContentItem.h"
#include <iostream>
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

    // Insert at tail: O(n)
    void append(const ContentItem& item) {
        ContentNode* newNode = new ContentNode(item);
        if (head == nullptr) {
            head = newNode;
        } else {
            ContentNode* temp = head;
            while (temp->next != nullptr) {
                temp = temp->next;
            }
            temp->next = newNode;
        }
        count++;
    }

    // Overloaded Search #1: Find by exact Content ID
    ContentItem* search(const std::string& contentId) {
        ContentNode* current = head;
        while (current != nullptr) {
            if (current->data.getId() == contentId) {
                return &(current->data);
            }
            current = current->next;
        }
        return nullptr;
    }

    // Overloaded Search #2: Find all items matching Channel ID and Status
    std::vector<ContentItem> search(const std::string& channelId, const std::string& status) const {
        std::vector<ContentItem> results;
        ContentNode* current = head;
        while (current != nullptr) {
            if (current->data.getChannelId() == channelId &&
                current->data.getStatus() == status) {
                results.push_back(current->data);
            }
            current = current->next;
        }
        return results;
    }

    // Delete by Content ID: O(n)
    bool removeById(const std::string& contentId) {
        if (head == nullptr) return false;

        if (head->data.getId() == contentId) {
            ContentNode* toDelete = head;
            head = head->next;
            delete toDelete;
            count--;
            return true;
        }

        ContentNode* current = head;
        while (current->next != nullptr && current->next->data.getId() != contentId) {
            current = current->next;
        }

        if (current->next != nullptr) {
            ContentNode* toDelete = current->next;
            current->next = toDelete->next;
            delete toDelete;
            count--;
            return true;
        }
        return false;
    }

    int size() const { return count; }
    ContentNode* getHead() const { return head; }
};

#endif // CONTENT_SLL_H`,
  },
  {
    path: 'structures/TaskDLL.h',
    folder: 'structures',
    title: 'TaskDLL.h — Manual Doubly Linked List for Production Tasks',
    description: 'Implements a Doubly Linked List (DLL) with prev and next pointers to support bidirectional traversal across the 7 production stages.',
    concepts: ['Doubly Linked List (DLL)', 'Bidirectional Pointers (prev/next)', 'Stage Progression & Regression'],
    code: `#ifndef TASK_DLL_H
#define TASK_DLL_H

#include "../models/Task.h"
#include <iostream>

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

    // Remove a node with bidirectional pointer re-linking
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

    // Traverse Forward (Stage 1 -> Stage 7)
    void displayForward() const {
        TaskNode* curr = head;
        while (curr != nullptr) {
            std::cout << curr->data.serialize() << " <-> ";
            curr = curr->next;
        }
        std::cout << "NULL\\n";
    }

    // Traverse Backward (Stage 7 -> Stage 1)
    void displayReverse() const {
        TaskNode* curr = tail;
        while (curr != nullptr) {
            std::cout << curr->data.serialize() << " <-> ";
            curr = curr->prev;
        }
        std::cout << "NULL\\n";
    }

    int size() const { return count; }
    TaskNode* getHead() const { return head; }
    TaskNode* getTail() const { return tail; }
};

#endif // TASK_DLL_H`,
  },
  {
    path: 'structures/ScheduleCLL.h',
    folder: 'structures',
    title: 'ScheduleCLL.h — Manual Circular Linked List for Publishing Rotation',
    description: 'Implements a Circular Linked List (CLL) where tail->next points back to head, enabling endless round-robin channel rotation.',
    concepts: ['Circular Linked List (CLL)', 'Round-Robin Scheduling', 'Ring Pointer Manipulation'],
    code: `#ifndef SCHEDULE_CLL_H
#define SCHEDULE_CLL_H

#include "../models/Channel.h"
#include <iostream>

struct ScheduleNode {
    Channel data;
    ScheduleNode* next;

    ScheduleNode(const Channel& ch) : data(ch), next(this) {}
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
        if (head == nullptr) return;
        ScheduleNode* curr = head;
        for (int i = 0; i < count; ++i) {
            ScheduleNode* nextNode = curr->next;
            delete curr;
            curr = nextNode;
        }
        head = tail = current = nullptr;
        count = 0;
    }

    // Insert channel into circular ring (tail->next = head)
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

    // Advance publishing rotation in O(1)
    Channel* rotateNext() {
        if (current == nullptr) return nullptr;
        current = current->next;
        return &(current->data);
    }

    Channel* getCurrentChannel() const {
        return current ? &(current->data) : nullptr;
    }

    int size() const { return count; }
    ScheduleNode* getHead() const { return head; }
};

#endif // SCHEDULE_CLL_H`,
  },
  {
    path: 'managers/FileManager.h',
    folder: 'managers',
    title: 'FileManager.h — Persistent Text-File I/O Manager',
    description: 'Reads and writes channels.txt, content.txt, tasks.txt, and schedule.txt using std::ifstream and std::ofstream.',
    concepts: ['File I/O (ifstream/ofstream)', 'Pipe-Delimited Serialization', 'Data Persistence'],
    code: `#ifndef FILE_MANAGER_H
#define FILE_MANAGER_H

#include "../structures/ContentSLL.h"
#include "../structures/TaskDLL.h"
#include "../structures/ScheduleCLL.h"
#include <fstream>
#include <vector>

class FileManager {
public:
    static bool saveAll(const std::vector<Channel>& channels,
                        const ContentSLL& contentList,
                        const TaskDLL& taskList,
                        const ScheduleCLL& scheduleRing) {
        // 1. Write data/channels.txt
        std::ofstream chFile("data/channels.txt");
        for (const auto& ch : channels) {
            chFile << ch.serialize() << "\\n";
        }
        chFile.close();

        // 2. Write data/content.txt
        std::ofstream cntFile("data/content.txt");
        ContentNode* cNode = contentList.getHead();
        while (cNode != nullptr) {
            cntFile << cNode->data.serialize() << "\\n";
            cNode = cNode->next;
        }
        cntFile.close();

        // 3. Write data/tasks.txt
        std::ofstream tskFile("data/tasks.txt");
        TaskNode* tNode = taskList.getHead();
        while (tNode != nullptr) {
            tskFile << tNode->data.serialize() << "\\n";
            tNode = tNode->next;
        }
        tskFile.close();

        // 4. Write data/schedule.txt
        std::ofstream schFile("data/schedule.txt");
        if (scheduleRing.getCurrentChannel() != nullptr) {
            schFile << "CURRENT|" << scheduleRing.getCurrentChannel()->getId() << "\\n";
        }
        schFile.close();

        return true;
    }
};

#endif // FILE_MANAGER_H`,
  },
  {
    path: 'main.cpp',
    folder: 'root',
    title: 'main.cpp — Menu-Driven CLI Entry Point',
    description: 'Provides the interactive command-line menu loop connecting CreatorDesk managers, linked lists, and file storage.',
    concepts: ['CLI Menu Loop', 'System Integration', 'CRUD Operations'],
    code: `#include <iostream>
#include "models/Channel.h"
#include "models/ContentItem.h"
#include "models/Task.h"
#include "structures/ContentSLL.h"
#include "structures/TaskDLL.h"
#include "structures/ScheduleCLL.h"
#include "managers/FileManager.h"

void printBanner() {
    std::cout << "========================================================\\n";
    std::cout << "   CREATORDESK - MULTI-CHANNEL CONTENT MANAGEMENT CLI   \\n";
    std::cout << "   Data Structures: ContentSLL | TaskDLL | ScheduleCLL  \\n";
    std::cout << "========================================================\\n";
}

int main() {
    ContentSLL contentList;
    TaskDLL taskList;
    ScheduleCLL rotationRing;

    printBanner();
    std::cout << "1. Dashboard Summary\\n"
              << "2. Manage Channels & Rotation (ScheduleCLL)\\n"
              << "3. Manage Content Ideas (ContentSLL)\\n"
              << "4. 7-Stage Production Task Pipeline (TaskDLL)\\n"
              << "5. Save & Export to data/*.txt\\n"
              << "0. Exit CreatorDesk\\n";
    return 0;
}`,
  },
];
