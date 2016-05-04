#!/usr/bin/env bash

electron-packager . Telepresence --platform=darwin,linux,win32 --arch=x64 --prune --overwrite

zip -r -9 Telepresence-darwin-x64.zip Telepresence-darwin-x64/*
zip -r -9 Telepresence-linux-x64.zip Telepresence-linux-x64/*
zip -r -9 Telepresence-win32-x64.zip Telepresence-win32-x64/*
