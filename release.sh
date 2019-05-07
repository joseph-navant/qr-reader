#!/bin/sh

if ! [ -x "$(command -v jq)" ]; then
  echo "Error: jq is not installed." >&2
  echo "https://stedolan.github.io/jq/"
  exit 1
fi

if ! [ -z "$(git status -z)" ]; then
  echo "Repository not clean, ensure you have committed all your changes"
  exit 1
fi

CURRENT=$(jq .version package.json | tr -d '"')
BRANCH=$(git branch | grep \* | cut -d ' ' -f2-)

if [ $BRANCH != "develop" ]; then
  echo "Not in develop branch"
else
  # Ensuring master is updated
  echo "Ensuring master is updated"
  git checkout master
  git pull
  git checkout develop

  # Create release
  git flow release start $CURRENT || exit 1

  # Remove old files
  rm -rf dist www

  # Build
  npm run build

  git commit -am "Generating v$CURRENT"
  GIT_MERGE_AUTOEDIT=no git flow release finish -m $CURRENT $CURRENT

  # Publish release
  git checkout master
  git push origin HEAD --tags
  git checkout develop

  # Bump package.json
  npm version patch --no-git-tag-version
  CURRENT=$(jq .version package.json | tr -d '"')
  git commit -am "Bumped version to $CURRENT"
  git push
fi
