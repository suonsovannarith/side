#ifndef CONTENT_ITEM_H
#define CONTENT_ITEM_H

#include "SyncMetadata.h"
#include <string>
#include <iostream>
#include <sstream>

class ContentItem {
private:
    std::string contentId;
    std::string title;
    std::string channelId;
    std::string type;               // "Short-form" or "Long-form"
    std::string priority;           // "High", "Medium", "Low"
    std::string status;             // "Idea", "In Production", "Ready to Publish", "Published"
    std::string plannedPublishDate; // YYYY-MM-DD
    std::string assetFilePath;
    std::string notes;

    // Rule 3: Sync State for Hybrid IndexedDB/Cloud Persistence
    uint64_t lastModified;
    bool isDirty;

public:
    ContentItem()
        : contentId("CNT-000"), title("Draft Concept"), channelId("CH-01"),
          type("Short-form"), priority("Medium"), status("Idea"),
          plannedPublishDate("2026-03-31"), assetFilePath(""), notes(""),
          lastModified(currentTimestampMs()), isDirty(false) {}

    ContentItem(const std::string& id, const std::string& title, const std::string& chId)
        : contentId(id), title(title), channelId(chId),
          type("Long-form"), priority("High"), status("Idea"),
          plannedPublishDate("2026-03-15"), assetFilePath("/data/assets/" + chId + "/" + id + ".md"),
          notes("Ingested from creative backlog"),
          lastModified(currentTimestampMs()), isDirty(true) {}

    ContentItem(const std::string& id, const std::string& title, const std::string& chId,
                const std::string& type, const std::string& priority, const std::string& status,
                const std::string& date, const std::string& path, const std::string& notes = "")
        : contentId(id), title(title), channelId(chId),
          type(type), priority(priority), status(status),
          plannedPublishDate(date), assetFilePath(path), notes(notes),
          lastModified(currentTimestampMs()), isDirty(true) {}

    std::string getId() const { return contentId; }
    std::string getTitle() const { return title; }
    std::string getChannelId() const { return channelId; }
    std::string getType() const { return type; }
    std::string getPriority() const { return priority; }
    std::string getStatus() const { return status; }
    std::string getPlannedPublishDate() const { return plannedPublishDate; }
    std::string getAssetFilePath() const { return assetFilePath; }
    std::string getNotes() const { return notes; }

    uint64_t getLastModified() const { return lastModified; }
    bool getIsDirty() const { return isDirty; }

    void setTitle(const std::string& t) { title = t; markDirty(); }
    void setPriority(const std::string& p) { priority = p; markDirty(); }
    void setStatus(const std::string& s) { status = s; markDirty(); }
    void setPlannedPublishDate(const std::string& d) { plannedPublishDate = d; markDirty(); }
    void setAssetFilePath(const std::string& p) { assetFilePath = p; }
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

    void updateStatus(const std::string& newStatus) {
        status = newStatus;
        markDirty();
    }

    void updateStatus(const std::string& newStatus, const std::string& appendNote) {
        status = newStatus;
        if (!appendNote.empty()) {
            notes += " | " + appendNote;
        }
        markDirty();
    }

    std::string serialize() const {
        std::ostringstream oss;
        oss << contentId << "|" << title << "|" << channelId << "|"
            << type << "|" << priority << "|" << status << "|"
            << plannedPublishDate << "|" << assetFilePath << "|" << notes << "|"
            << lastModified << "|" << (isDirty ? "1" : "0");
        return oss.str();
    }
};

#endif // CONTENT_ITEM_H
