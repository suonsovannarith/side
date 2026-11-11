CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2 -I. -Imodels -Istructures -Imanagers

all: creatordesk_cli test_structures

creatordesk_cli: main.cpp
	$(CXX) $(CXXFLAGS) -o creatordesk_cli main.cpp

test_structures: tests/test_structures.cpp
	$(CXX) $(CXXFLAGS) -o test_structures tests/test_structures.cpp

test: test_structures
	./test_structures

clean:
	rm -f creatordesk_cli creatordesk_cli.exe test_structures test_structures.exe
