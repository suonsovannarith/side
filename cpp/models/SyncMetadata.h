#ifndef SYNC_METADATA_H
#define SYNC_METADATA_H

#include <chrono>
#include <cstdint>

inline uint64_t currentTimestampMs() {
    return static_cast<uint64_t>(
        std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count()
    );
}

#endif // SYNC_METADATA_H
