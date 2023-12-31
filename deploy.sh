# Exit if any command returns non-zero error code
set -e

# Check no uncommitted changes
if ! [ -z "$(git status --porcelain)" ]; then 
  echo "Working directory is not clean."
  exit 1
fi

# Read semver level (major, minor, patch), default to minor
semverLevel=${1:-minor}

# Build
npm run build

# Commit
version=`npx next-standard-version --releaseAs $semverLevel`

git add .
git commit -m "Build version $version"

# Tag
npm version $semverLevel

# Push
git push --follow-tags
git subtree push --prefix build origin gh-pages
