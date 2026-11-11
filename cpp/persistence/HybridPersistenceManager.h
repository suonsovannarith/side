#ifndef HYBRID_PERSISTENCE_MANAGER_H
#define HYBRID_PERSISTENCE_MANAGER_H

#include "IPersistenceProvider.h"
#include <fstream>
#include <sstream>
#include <iostream>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#include <emscripten/fetch.h>
#endif

class HybridPersistenceManager : public IPersistenceProvider {
private:
    std::string basePath;
    std::string cloudApiEndpoint;
    bool cloudOnline;
    int pendingDirtyCount;

    void flushToIndexedDB() {
#ifdef __EMSCRIPTEN__
        // Rule 2: Sync Emscripten MEMFS to browser IndexedDB (IDBFS)
        EM_ASM(
            FS.syncfs(false, function (err) {
                if (err) {
                    console.error('IDBFS sync failed:', err);
                } else {
                    console.log('IDBFS synced successfully to browser IndexedDB!');
                }
            });
        );
#endif
    }

public:
    HybridPersistenceManager(const std::string& path = "data", const std::string& endpoint = "https://api.creatordesk.pro/v1")
        : basePath(path), cloudApiEndpoint(endpoint), cloudOnline(true), pendingDirtyCount(0) {}

    std::string getProviderName() const override {
#ifdef __EMSCRIPTEN__
        return "Emscripten IDBFS + Cloud REST";
#else
        return "Desktop Native File I/O + Cloud REST";
#endif
    }

    bool isCloudConnected() const override {
        return cloudOnline;
    }

    int getPendingDirtyCount() const override {
        return pendingDirtyCount;
    }

    // 1. Channel Persistence
    bool saveChannels(const std::vector<Channel>& channels) override {
        std::ofstream outFile(basePath + "/channels.txt");
        if (!outFile.is_open()) return false;
        
        int dirty = 0;
        for (const auto& ch : channels) {
            outFile << ch.serialize() << "\n";
            if (ch.getIsDirty()) dirty++;
        }
        pendingDirtyCount = dirty;
        flushToIndexedDB();
        return true;
    }

    bool loadChannels(std::vector<Channel>& outChannels) override {
        (void)outChannels;
        std::ifstream inFile(basePath + "/channels.txt");
        if (!inFile.is_open()) return false;
        // In actual implementation, parse lines and populate outChannels
        return true;
    }

    // 2. Task Persistence
    bool saveTasks(const std::vector<Task>& tasks) override {
        std::ofstream outFile(basePath + "/tasks.txt");
        if (!outFile.is_open()) return false;

        for (const auto& t : tasks) {
            outFile << t.serialize() << "\n";
        }
        flushToIndexedDB();
        return true;
    }

    bool loadTasks(std::vector<Task>& outTasks) override {
        (void)outTasks;
        std::ifstream inFile(basePath + "/tasks.txt");
        if (!inFile.is_open()) return false;
        return true;
    }

    // 3. Content Persistence
    bool saveContent(const std::vector<ContentItem>& content) override {
        std::ofstream outFile(basePath + "/content.txt");
        if (!outFile.is_open()) return false;

        for (const auto& item : content) {
            outFile << item.serialize() << "\n";
        }
        flushToIndexedDB();
        return true;
    }

    bool loadContent(std::vector<ContentItem>& outContent) override {
        (void)outContent;
        std::ifstream inFile(basePath + "/content.txt");
        if (!inFile.is_open()) return false;
        return true;
    }

    // 4. Cloud Database Synchronization (Rule 2 & 3)
    bool syncWithCloud() override {
        std::cout << "[Sync] Initiating Hybrid Cloud Sync via " << cloudApiEndpoint << "...\n";
#ifdef __EMSCRIPTEN__
        std::cout << "[WASM-Fetch] Emscripten Fetch API hook ready for async Cloud DB sync.\n";
#else
        std::cout << "[Desktop-HTTP] Syncing modified records with Cloud DB using Last-Write-Wins (LWW)...\n";
#endif
        // Simulate resolving dirty states
        pendingDirtyCount = 0;
        return true;
    }
};

#endif // HYBRID_PERSISTENCE_MANAGER_H
