#!/usr/bin/env bash

#wait_for_server() {
#  local server_up
#  server_up=false
#
#  while ! server_up ; do
#    curl -H "Accept: application/json" --connect-timeout 2 -s -D - "$1" -o /dev/null 2>/dev/null | head -n1 | grep 200
#  done
#}

main(){

  # Have to wait until api is ready...
  # Sleep for temporary hack, do a retry instead
  echo "Waiting for API to be ready..."
  sleep 10

  # Register some dummy users
  curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"username": "john", "email": "john@wick.com", "password": "keanu"}' \
    http://localhost:5000/users

  curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"username": "alon", "email": "alon@mask.com", "password": "doge"}' \
    http://localhost:5000/users

}

main
