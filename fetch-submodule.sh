#!/bin/bash

# GitHub submodule repo address without https:// prefix
SUBMODULE_GITHUB=github.com/mrmierzejewski/hugo-theme-console

# .gitmodules submodule path
SUBMODULE_PATH=themes/hugo-theme-console

# GitHub access token (optional for public repos, but good practice)
# Add it to Environment Variables on Vercel
if [ "$GITHUB_ACCESS_TOKEN" == "" ]; then
  echo "Warning: GITHUB_ACCESS_TOKEN is empty. Proceeding for public repo..."
fi

# Stop execution on error
set -e

# Get submodule commit
output=`git submodule status --recursive` # Get submodule info
no_prefix=${output#*-} # Remove the prefix (e.g., "-<hash>")
COMMIT=${no_prefix% *} # Remove the suffix (e.g., " (heads/main)")

# Set up an empty temporary work directory
rm -rf tmp || true # Remove the tmp folder if exists
mkdir tmp # Create the tmp folder
cd tmp # Go into the tmp folder

# Checkout the current submodule commit
git init # Initialize empty repo
if [ "$GITHUB_ACCESS_TOKEN" != "" ]; then
  git remote add origin https://$GITHUB_ACCESS_TOKEN@$SUBMODULE_GITHUB # Add origin with token
else
  git remote add origin https://$SUBMODULE_GITHUB # Add origin without token (public repo)
fi
git fetch --depth=1 origin $COMMIT # Fetch only the required commit
git checkout $COMMIT # Checkout the right commit

# Move the submodule from tmp to the submodule path
cd .. # Go folder up
rm -rf tmp/.git # Remove .git
mv tmp/* $SUBMODULE_PATH/ # Move the submodule to the submodule path

# Clean up
rm -rf tmp # Remove the tmp folder