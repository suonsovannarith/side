#ifndef FILE_MANAGER_H
#define FILE_MANAGER_H

#include "../models/Channel.h"
#include "../models/ContentItem.h"
#include "../models/Task.h"
#include "../structures/ContentSLL.h"
#include "../structures/TaskDLL.h"
#include "../structures/ScheduleCLL.h"
#include <fstream>
#include <sstream>
#include <vector>
#include <iostream>

class FileManager {
public:
    static bool saveChannels(const std::string& filepath, const std::vector<Channel>& channels) {
        std::ofstream outFile(filepath);
        if (!outFile.is_open()) return false;
        for (const auto& ch : channels) {
            outFile << ch.serialize() << "\n";
        }
        return true;
    }

    static bool saveContent(const std::string& filepath, const ContentSLL& contentList) {
        std::ofstream outFile(filepath);
        if (!outFile.is_open()) return false;
        ContentNode* curr = contentList.getHead();
        while (curr != nullptr) {
            outFile << curr->data.serialize() << "\n";
            curr = curr->next;
        }
        return true;
    }

    static bool saveTasks(const std::string& filepath, const TaskDLL& taskList) {
        std::ofstream outFile(filepath);
        if (!outFile.is_open()) return false;
        TaskNode* curr = taskList.getHead();
        while (curr != nullptr) {
            outFile << curr->data.serialize() << "\n";
            curr = curr->next;
        }
        return true;
    }
};

#endif // FILE_MANAGER_H
