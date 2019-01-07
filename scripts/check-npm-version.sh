#!/bin/bash
if [[ `npm view . version` == `jq -r .version package.json` ]]; then
  echo 'This version already exists in NPM, please bump the version';
  exit 1;
fi
exit 0;
