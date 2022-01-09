#!/bin/bash

# Utility script that deletes the containers, rebuilds the web server container and then restarts the service.
docker-compose down
docker rmi crypto-backend:latest
docker-compose up