#!/usr/bin/env bash

main(){
  # Register some dummy users
  curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"username": "john123", "email": "john@wick.com", "password": "keanu"}' \
    http://localhost:5000/users

  curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"username": "alon123", "email": "alon@mask.com", "password": "doge"}' \
    http://localhost:5000/users

}

main
