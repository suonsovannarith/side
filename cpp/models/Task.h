#ifndef TASK_H
#define TASK_H

#include "SyncMetadata.h"
#include <string>
#include <iostream>
#include <sstream>

class Task {
private:
    std::string taskId;
    std::string contentId;
    int stageNumber; // 1 to 7
    std::string stageName;
    std::string status; // "Pending", "In Progress", "Completed", "Blocked"
    std::string dueDate; // YYYY-MM-DD
    std::string toolOrAssignee;
    std::string notes;

    // Rule 3: Sync State for Hybrid IndexedDB/Cloud Persistence
    uint64_t lastModified;
    bool isDirty;

public:
    Task()
        : taskId("TSK-000"), contentId("CNT-000"), stageNumber(1),
          stageName("Research concept"), status("Pending"),
          dueDate("2026-03-31"), toolOrAssignee("Perplexity / Trends"),
          notes(""), lastModified(currentTimestampMs()), isDirty(false) {}

    Task(const std::string& id, const std::string& cntId, int stage,
         const std::string& name, const std::string& status,
         const std::string& due, const std::string& tool, const std::string& notes = "")
        : taskId(id), contentId(cntId), stageNumber(stage),
          stageName(name), status(status), dueDate(due),
          toolOrAssignee(tool), notes(notes),
          lastModified(currentTimestampMs()), isDirty(true) {}

    std::string getId() const { return taskId; }
    std::string getContentId() const { return contentId; }
    int getStageNumber() const { return stageNumber; }
    std::string getStageName() const { return stageName; }
    std::string getStatus() const { return status; }
    std::string getDueDate() const { return dueDate; }
    std::string getToolOrAssignee() const { return toolOrAssignee; }
    std::string getNotes() const { return notes; }

    uint64_t getLastModified() const { return lastModified; }
    bool getIsDirty() const { return isDirty; }

    void setStageNumber(int n) { stageNumber = n; markDirty(); }
    void setStageName(const std::string& n) { stageName = n; markDirty(); }
    void setStatus(const std::string& s) { status = s; markDirty(); }
    void setDueDate(const std::string& d) { dueDate = d; markDirty(); }
    void setToolOrAssignee(const std::string& t) { toolOrAssignee = t; markDirty(); }
    void setNotes(const std::string& n) { notes = n; markDirty(); }

    void markDirty() {
        isDirty = true;
        lastModified = currentTimestampMs();
    }

    void markClean() {
        isDirty = false;
    }

    void setSyncState(uint64_t timestamp, bool dirty) {
        lastModified = timestamp;
        isDirty = dirty;
    }

    std::string serialize() const {
        std::ostringstream oss;
        oss << taskId << "|" << contentId << "|" << stageNumber << "|"
            << stageName << "|" << status << "|" << dueDate << "|"
            << toolOrAssignee << "|" << notes << "|"
            << lastModified << "|" << (isDirty ? "1" : "0");
        return oss.str();
    }
};

#endif // TASK_H
