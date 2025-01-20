#!/bin/bash

pnpm config set store-dir $HOME/.pnpm-store
pnpm exec playwright install chromium --with-deps