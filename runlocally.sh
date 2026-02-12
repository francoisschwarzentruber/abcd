#!/usr/bin/env sh
echo "Opening http://127.0.0.1:8123/"
php -S 127.0.0.1:8123
${BROWSER:-firefox} "http://127.0.0.1:8123/"
