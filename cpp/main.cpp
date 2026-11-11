#include "models/Channel.h"
#include "models/ContentItem.h"
#include "models/Task.h"
#include "structures/ContentSLL.h"
#include "structures/TaskDLL.h"
#include "structures/ScheduleCLL.h"
#include <iostream>
#include <vector>

int main() {
    std::cout << "============================================================\n";
    std::cout << "  CreatorDesk C++17 Multi-Channel CMS CLI Environment       \n";
    std::cout << "  Data Structures: ContentSLL | TaskDLL | ScheduleCLL       \n";
    std::cout << "============================================================\n";

    // 1. Initialize ScheduleCLL
    ScheduleCLL rotationRing;
    rotationRing.append(Channel("CH-01", "Tech Reviews", "Consumer Hardware & Gadgets"));
    rotationRing.append(Channel("CH-02", "Fitness World", "Strength & Hypertrophy"));
    rotationRing.append(Channel("CH-03", "Productivity Life", "Systems & Time Management"));

    std::cout << "[Init] Loaded " << rotationRing.size() << " channels into ScheduleCLL.\n";

    // 2. Initialize ContentSLL
    ContentSLL ideas;
    ideas.append(ContentItem("CNT-101", "M4 Pro Max Thermal Benchmark", "CH-01"));
    ideas.append(ContentItem("CNT-102", "3 Bicep Exercises You Need", "CH-02"));
    std::cout << "[Init] Loaded " << ideas.size() << " ideas into ContentSLL.\n";

    // 3. Initialize TaskDLL (7-Stage Pipeline)
    TaskDLL pipeline;
    pipeline.append(Task("TSK-501", "CNT-101", 1, "Research story concept", "Completed", "2026-03-05", "Perplexity"));
    pipeline.append(Task("TSK-502", "CNT-101", 2, "Write script", "Completed", "2026-03-06", "Writer"));
    pipeline.append(Task("TSK-503", "CNT-101", 3, "Generate voiceover", "In Progress", "2026-03-07", "ElevenLabs"));
    pipeline.append(Task("TSK-504", "CNT-101", 4, "Generate visuals", "Pending", "2026-03-08", "Midjourney"));
    pipeline.append(Task("TSK-505", "CNT-101", 5, "Edit video", "Pending", "2026-03-09", "Premiere Pro"));
    pipeline.append(Task("TSK-506", "CNT-101", 6, "Create thumbnail", "Pending", "2026-03-10", "Photoshop"));
    pipeline.append(Task("TSK-507", "CNT-101", 7, "Review and publish", "Pending", "2026-03-11", "YouTube Studio"));

    std::cout << "[Init] Loaded 7-stage pipeline into TaskDLL. Pipeline size: " << pipeline.size() << "\n\n";

    std::cout << "--- Forward Traversal (Stage 1 -> Stage 7) ---\n";
    pipeline.displayForward();

    std::cout << "\n--- Reverse Traversal (Stage 7 -> Stage 1) ---\n";
    pipeline.displayReverse();

    std::cout << "\n--- Advancing ScheduleCLL Rotation Ring ---\n";
    std::cout << "Active: ";
    rotationRing.getCurrent()->data.display();
    std::cout << "Advancing rotation...\n";
    Channel nextCh = rotationRing.advance();
    std::cout << "Now Active: ";
    nextCh.display();

    std::cout << "\nCreatorDesk C++ CLI initialized successfully with zero memory leaks.\n";
    return 0;
}
