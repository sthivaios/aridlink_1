#!/bin/bash

echo "ALIM Development Device Key Generator"
echo "==========================================="
read -p "KEY LENGTH (INT) > " length

bytes=$((length / 2))

key=$(openssl rand -hex $bytes)
hashed=$(echo -n $key | sha256)

echo KEY: $key
echo SHA256: $hashed