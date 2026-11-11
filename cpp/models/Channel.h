#ifndef CHANNEL_H
#define CHANNEL_H

#include "SyncMetadata.h"
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

    // Rule 3: Sync State for Hybrid IndexedDB/Cloud Persistence
    uint64_t lastModified;
    bool isDirty;

public:
    // 1. Default Constructor
    Channel()
        : channelId("CH-00"), name("Untitled Channel"), category("General"),
          description(""), lastUploadedDate("N/A"), activeInRotation(true),
          lastModified(currentTimestampMs()), isDirty(false) {}

    // 2. Basic Constructor
    Channel(const std::string& id, const std::string& name, const std::string& category)
        : channelId(id), name(name), category(category),
          description("Standard channel profile"), lastUploadedDate("Not uploaded yet"),
          activeInRotation(true), lastModified(currentTimestampMs()), isDirty(true) {}

    // 3. Full Parameterized Constructor
    Channel(const std::string& id, const std::string& name, const std::string& category,
            const std::string& desc, const std::string& lastUpload, bool active = true)
        : channelId(id), name(name), category(category),
          description(desc), lastUploadedDate(lastUpload), activeInRotation(active),
          lastModified(currentTimestampMs()), isDirty(true) {}

    // Getters & Setters
    std::string getId() const { return channelId; }
    std::string getName() const { return name; }
    std::string getCategory() const { return category; }
    std::string getDescription() const { return description; }
    std::string getLastUploadedDate() const { return lastUploadedDate; }
    bool isActiveInRotation() const { return activeInRotation; }

    uint64_t getLastModified() const { return lastModified; }
    bool getIsDirty() const { return isDirty; }

    void setName(const std::string& n) { name = n; markDirty(); }
    void setCategory(const std::string& c) { category = c; markDirty(); }
    void setDescription(const std::string& d) { description = d; markDirty(); }
    void setLastUploadedDate(const std::string& d) { lastUploadedDate = d; markDirty(); }
    void setActiveInRotation(bool a) { activeInRotation = a; markDirty(); }

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

    void display() const {
        std::cout << "[" << channelId << "] " << name << " (" << category << ")"
                  << (activeInRotation ? " [Active in Rotation]" : " [Inactive]")
                  << (isDirty ? " [DIRTY]" : " [SYNCED]") << "\n";
    }

    void display(bool detailed) const {
        display();
        if (detailed) {
            std::cout << "    Description  : " << description << "\n"
                      << "    Last Upload  : " << lastUploadedDate << "\n"
                      << "    LastModified : " << lastModified << "\n";
        }
    }

    std::string serialize() const {
        std::ostringstream oss;
        oss << channelId << "|" << name << "|" << category << "|"
            << description << "|" << lastUploadedDate << "|"
            << (activeInRotation ? "1" : "0") << "|"
            << lastModified << "|" << (isDirty ? "1" : "0");
        return oss.str();
    }
};

#endif // CHANNEL_H
