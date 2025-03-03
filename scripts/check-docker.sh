#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Midnight Infrastructure Status Check ===${NC}"
echo "Checking Docker containers and port mappings..."
echo

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Error: Docker is not running.${NC} Please start Docker Desktop and try again."
  exit 1
fi

# Check proof server
echo -e "${BLUE}Checking Proof Server:${NC}"
if [[ $(docker ps -q -f name=counter-proof-server) ]]; then
  echo -e "  • Counter Proof Server: ${GREEN}Running${NC}"
  PROOF_PORT=$(docker port counter-proof-server 2>/dev/null | grep 6300/tcp | cut -d ':' -f 2)
  if [[ -n "$PROOF_PORT" ]]; then
    echo -e "  • Port mapping: Internal 6300 → External ${GREEN}$PROOF_PORT${NC}"
    # Test if the port is responsive
    if curl -s "http://localhost:$PROOF_PORT/health" > /dev/null; then
      echo -e "  • Health check: ${GREEN}Passed${NC}"
    else
      echo -e "  • Health check: ${RED}Failed${NC} (Port $PROOF_PORT is not responding)"
    fi
  else
    echo -e "  • Port mapping: ${RED}Not found${NC}"
  fi
else
  echo -e "  • Counter Proof Server: ${RED}Not running${NC}"
fi

# Check indexer
echo -e "\n${BLUE}Checking Indexer:${NC}"
if [[ $(docker ps -q -f name=counter-indexer) ]]; then
  echo -e "  • Counter Indexer: ${GREEN}Running${NC}"
  INDEXER_PORT=$(docker port counter-indexer 2>/dev/null | grep 8088/tcp | cut -d ':' -f 2)
  if [[ -n "$INDEXER_PORT" ]]; then
    echo -e "  • Port mapping: Internal 8088 → External ${GREEN}$INDEXER_PORT${NC}"
  else
    echo -e "  • Port mapping: ${RED}Not found${NC}"
  fi
else
  echo -e "  • Counter Indexer: ${RED}Not running${NC}"
fi

# Check node
echo -e "\n${BLUE}Checking Node:${NC}"
if [[ $(docker ps -q -f name=counter-node) ]]; then
  echo -e "  • Counter Node: ${GREEN}Running${NC}"
  NODE_PORT=$(docker port counter-node 2>/dev/null | grep 9944/tcp | cut -d ':' -f 2)
  if [[ -n "$NODE_PORT" ]]; then
    echo -e "  • Port mapping: Internal 9944 → External ${GREEN}$NODE_PORT${NC}"
  else
    echo -e "  • Port mapping: ${RED}Not found${NC}"
  fi
else
  echo -e "  • Counter Node: ${RED}Not running${NC}"
fi

# Check environment files
echo -e "\n${BLUE}Checking Environment Configuration:${NC}"
ENV_FILE="$(dirname "$(dirname "$0")")/.env.local"

if [[ -f "$ENV_FILE" ]]; then
  echo -e "  • .env.local file: ${GREEN}Found${NC}"
  
  # Extract values from .env.local
  PROOF_SERVER_URL=$(grep NEXT_PUBLIC_PROOF_SERVER_URL "$ENV_FILE" | cut -d '=' -f 2)
  INDEXER_URL=$(grep NEXT_PUBLIC_INDEXER_URL "$ENV_FILE" | cut -d '=' -f 2)
  NODE_URL=$(grep NEXT_PUBLIC_NODE_URL "$ENV_FILE" | cut -d '=' -f 2)
  
  # Compare with actual port mappings
  if [[ -n "$PROOF_PORT" && "$PROOF_SERVER_URL" != *":$PROOF_PORT"* ]]; then
    echo -e "  • ${YELLOW}Warning:${NC} Proof Server URL ($PROOF_SERVER_URL) doesn't match actual port (:$PROOF_PORT)"
  fi
  
  if [[ -n "$INDEXER_PORT" && "$INDEXER_URL" != *":$INDEXER_PORT"* ]]; then
    echo -e "  • ${YELLOW}Warning:${NC} Indexer URL ($INDEXER_URL) doesn't match actual port (:$INDEXER_PORT)"
  fi
  
  if [[ -n "$NODE_PORT" && "$NODE_URL" != *":$NODE_PORT"* ]]; then
    echo -e "  • ${YELLOW}Warning:${NC} Node URL ($NODE_URL) doesn't match actual port (:$NODE_PORT)"
  fi
  
  # Suggest updates if needed
  echo -e "\n${BLUE}Suggested .env.local configuration:${NC}"
  if [[ -n "$PROOF_PORT" ]]; then
    echo "NEXT_PUBLIC_PROOF_SERVER_URL=http://localhost:$PROOF_PORT"
  else
    echo "$PROOF_SERVER_URL"
  fi
  
  if [[ -n "$INDEXER_PORT" ]]; then
    echo "NEXT_PUBLIC_INDEXER_URL=http://localhost:$INDEXER_PORT"
  else
    echo "$INDEXER_URL"
  fi
  
  if [[ -n "$NODE_PORT" ]]; then
    echo "NEXT_PUBLIC_NODE_URL=http://localhost:$NODE_PORT"
  else
    echo "$NODE_URL"
  fi
  
else
  echo -e "  • .env.local file: ${RED}Not found${NC}"
fi

echo -e "\n${BLUE}=== Summary ===${NC}"
if [[ -n "$PROOF_PORT" && -n "$INDEXER_PORT" && -n "$NODE_PORT" ]]; then
  echo -e "All required services are ${GREEN}running${NC}."
  echo "Make sure your Lace wallet is correctly configured with these endpoints."
else
  echo -e "${RED}One or more required services are not running.${NC}"
  echo "Please start the required Docker containers using the run.sh script."
fi 