#!/bin/bash

# GitHub submodule repo address without https:// prefix
SUBMODULE_GITHUB=github.com/mrmierzejewski/hugo-theme-console

# .gitmodules submodule path
SUBMODULE_PATH=themes/hugo-theme-console

# GitHub access token (optional for public repos, but good practice)
if [ "$GITHUB_ACCESS_TOKEN" == "" ]; then
  echo "Warning: GITHUB_ACCESS_TOKEN is empty. Proceeding for public repo..."
fi

# Stop execution on error
set -e

# Enable verbose output for debugging
set -x

# Get submodule commit
echo "Fetching submodule commit..."
output=`git submodule status --recursive` # Get submodule info
echo "Submodule status: $output"
# Extract the commit hash (first field after leading space)
COMMIT=$(echo "$output" | awk '{print $1}' | tr -d '-')
echo "Submodule commit: $COMMIT"

# Validate commit hash
if [ -z "$COMMIT" ]; then
  echo "Error: Submodule commit hash is empty!"
  exit 1
fi

# Set up an empty temporary work directory
echo "Setting up temporary directory..."
rm -rf tmp || true # Remove the tmp folder if exists
mkdir tmp # Create the tmp folder
cd tmp # Go into the tmp folder

# Checkout the current submodule commit
echo "Initializing Git repository..."
git init # Initialize empty repo
if [ "$GITHUB_ACCESS_TOKEN" != "" ]; then
  echo "Adding remote with access token..."
  git remote add origin https://$GITHUB_ACCESS_TOKEN@$SUBMODULE_GITHUB
else
  echo "Adding remote without access token..."
  git remote add origin https://$SUBMODULE_GITHUB
fi
echo "Fetching commit $COMMIT..."
git fetch --depth=1 origin $COMMIT || { echo "Error: Failed to fetch commit $COMMIT"; exit 1; }
echo "Checking out commit $COMMIT..."
git checkout $COMMIT || { echo "Error: Failed to checkout commit $COMMIT"; exit 1; }

# Move the submodule from tmp to the submodule path
echo "Moving submodule to $SUBMODULE_PATH..."
cd .. # Go folder up
rm -rf tmp/.git # Remove .git
# Remove the existing submodule path to avoid conflicts
rm -rf $SUBMODULE_PATH || true
mkdir -p $SUBMODULE_PATH
mv tmp/* $SUBMODULE_PATH/ || { echo "Error: Failed to move submodule to $SUBMODULE_PATH"; exit 1; }

# Clean up
echo "Cleaning up..."
rm -rf tmp # Remove the tmp folder