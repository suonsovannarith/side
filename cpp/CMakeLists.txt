cmake_minimum_required(VERSION 3.15)
project(CreatorDesk CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/models
    ${CMAKE_CURRENT_SOURCE_DIR}/structures
    ${CMAKE_CURRENT_SOURCE_DIR}/managers
)

# CLI Binary
add_executable(creatordesk_cli main.cpp)

# Unit Test Harness
add_executable(test_structures tests/test_structures.cpp)
