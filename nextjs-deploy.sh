echo "Deployment starting..."

# install dependencies if any
npm install || exit

# set build folder to `.temp-build` and build
BUILD_DIR=.temp-build npm run build || exit

if [ ! -d ".temp-build" ]; then
  echo '\033[31m .temp-build directory does not exist!\033[0m'
  exit 1
fi

# delete `.next` folder
rm -rf .next

# rename `.temp-build` folder to `.next`
mv .temp-build .next

echo "Deployment done."
