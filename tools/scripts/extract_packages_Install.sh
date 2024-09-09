#!/bin/bash

PACKAGE_PATH='package.json'

# Extract all dependencies from the package.json file as an installable list of packages using bun
echo "Extracting packages from $PACKAGE_PATH"

# Read the contents of the file
contents=$(<"$PACKAGE_PATH")

# Extract the desired section for each service

start_marker='"dependencies": {'
end_marker='},'

echo "Extracting dependencies without versions as a list of packages in a single line"
dependencies=$(echo "$contents" | sed -n "/$start_marker/,/$end_marker/p" | sed -n 's/.*"\(.*\)": "\(.*\)".*/\1/p' | tr '\n' ' ')

echo "Extracted dependencies: $dependencies"

# Extract all dev dependencies from the package.json file as an installable list of packages using bun
echo "Extracting dev dependencies from $PACKAGE_PATH"

# Extract the desired section for each service

start_marker='"devDependencies": {'
end_marker='},'

echo "Extracting dev dependencies without versions as a list of packages in a single line"
dev_dependencies=$(echo "$contents" | sed -n "/$start_marker/,/$end_marker/p" | sed -n 's/.*"\(.*\)": "\(.*\)".*/\1/p' | tr '\n' ' ')

echo "Extracted dev dependencies: $dev_dependencies"
