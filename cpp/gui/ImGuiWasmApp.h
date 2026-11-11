#ifndef IMGUI_WASM_APP_H
#define IMGUI_WASM_APP_H

#include "../structures/TaskDLL.h"
#include "../structures/ScheduleCLL.h"
#include "../structures/ContentSLL.h"
#include "../persistence/IPersistenceProvider.h"
#include <iostream>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif

struct AppContext {
    TaskDLL* pipeline;
    ScheduleCLL* rotationRing;
    ContentSLL* ideas;
    IPersistenceProvider* persistence;
    bool running;
    int currentFrame;

    AppContext() : pipeline(nullptr), rotationRing(nullptr), ideas(nullptr),
                   persistence(nullptr), running(true), currentFrame(0) {}
};

/**
 * Rule 1: Standalone Single-Frame Render Pass
 * Decoupled from windowing/event loops to run identically on Desktop and WASM.
 */
inline void RenderFrame(void* userData) {
    AppContext* ctx = static_cast<AppContext*>(userData);
    if (!ctx) return;

    ctx->currentFrame++;

    // Simulated Dear ImGui Render Pass:
    // ImGui_ImplOpenGL3_NewFrame();
    // ImGui_ImplGlfw_NewFrame();
    // ImGui::NewFrame();
    
    // In real ImGui code:
    // ImGui::Begin("CreatorDesk - 4 Channels Multi-CMS & Pipeline");
    // ImGui::Text("Active Rotation: %s", ctx->rotationRing->getCurrent()->data.getName().c_str());
    // ...
    // ImGui::End();
    // ImGui::Render();
    // ImGui_ImplOpenGL3_RenderDrawData(ImGui::GetDrawData());
}

/**
 * Unified Entrypoint Supporting Both Desktop GLFW Loop and Emscripten WebAssembly
 */
inline void StartAppLoop(AppContext* ctx) {
#ifdef __EMSCRIPTEN__
    // WebAssembly Mode: Browser tab controls the animation frames (60fps requestAnimationFrame)
    std::cout << "[WASM] Configuring emscripten_set_main_loop_arg for 60fps browser rendering...\n";
    emscripten_set_main_loop_arg(RenderFrame, ctx, 0, 1);
#else
    // Desktop Native Mode: Standard blocking while-loop (e.g., GLFW / SDL2)
    std::cout << "[Desktop] Starting standard desktop render loop...\n";
    // For demonstration / testing:
    for (int i = 0; i < 5; ++i) {
        RenderFrame(ctx);
    }
    std::cout << "[Desktop] Executed " << ctx->currentFrame << " test frames successfully.\n";
#endif
}

#endif // IMGUI_WASM_APP_H
