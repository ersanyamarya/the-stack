#!/bin/bash

ENV_PATH='.env'

# extract envs between # - TEST SERVICE - and # - END TEST SERVICE -
echo "Extracting envs from $ENV_PATH"

# Array of services to extract
services=("TEST SERVICE" "ADMIN SERVICE")

# Read the contents of the file
contents=$(<"$ENV_PATH")

# Extract the desired section for each service
for service in "${services[@]}"; do
    start_marker="# - $service -"
    end_marker="# - END $service -"
    extracted_envs=$(echo "$contents" | sed -n "/$start_marker/,/$end_marker/p")

    # Save the extracted envs to a file
    echo "$extracted_envs" >.env."$service"
done
