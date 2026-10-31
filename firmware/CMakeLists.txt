# The following five lines of boilerplate have to be in your project's
# CMakeLists in this exact order for cmake to work correctly
cmake_minimum_required(VERSION 3.22)

# get rid of the firmware/ prefix from tags
execute_process(
        COMMAND git describe --match "firmware/v*" --always --dirty
        WORKING_DIRECTORY ${CMAKE_CURRENT_LIST_DIR}
        OUTPUT_VARIABLE PROJECT_VER
        OUTPUT_STRIP_TRAILING_WHITESPACE
)
string(REGEX REPLACE "^firmware/v" "" PROJECT_VER "${PROJECT_VER}")

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(AridLink_1_Firmware)
