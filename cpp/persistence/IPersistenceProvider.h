#ifndef I_PERSISTENCE_PROVIDER_H
#define I_PERSISTENCE_PROVIDER_H

#include "../models/Channel.h"
#include "../models/ContentItem.h"
#include "../models/Task.h"
#include <vector>
#include <string>

/**
 * Pure virtual interface decoupling storage and cloud synchronization
 * from Doubly Linked List, Singly Linked List, and Circular Linked List structures.
 *
 * Implements Rule 2:
 *  - Layer 1: Local Fast Cache (Desktop disk file I/O / Emscripten IDBFS IndexedDB)
 *  - Layer 2: Cloud Database Sync (REST API hooks via Fetch API / HTTP client)
 */
class IPersistenceProvider {
public:
    virtual ~IPersistenceProvider() = default;

    // Local Fast Cache Operations
    virtual bool saveChannels(const std::vector<Channel>& channels) = 0;
    virtual bool loadChannels(std::vector<Channel>& outChannels) = 0;

    virtual bool saveTasks(const std::vector<Task>& tasks) = 0;
    virtual bool loadTasks(std::vector<Task>& outTasks) = 0;

    virtual bool saveContent(const std::vector<ContentItem>& content) = 0;
    virtual bool loadContent(std::vector<ContentItem>& outContent) = 0;

    // Cloud Database Synchronization Hooks
    virtual bool syncWithCloud() = 0;
    virtual bool isCloudConnected() const = 0;
    virtual int getPendingDirtyCount() const = 0;
    virtual std::string getProviderName() const = 0;
};

#endif // I_PERSISTENCE_PROVIDER_H
