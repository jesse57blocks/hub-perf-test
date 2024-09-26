#!/bin/bash

LOAD_TEST_SCRIPT1="load_create_ip_with_existing_collection.ts"
LOG_FILE="load_test_output.log"      # Replace with your desired log file name

# Check if the compilation was successful
if [ $? -eq 0 ]; then
    # Run the compiled JavaScript file and redirect output to the log file
    node "${TS_FILE%.ts}.js" > "$LOG_FILE" 2>&1
    echo "Execution completed. Logs saved to $LOG_FILE."
else
    echo "Compilation failed."
fi