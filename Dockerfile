# Copyright 2025 Aviato Consulting

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

#     https://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


# Build stage
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

# Production stage
FROM node:20-slim

# Create non-root user
RUN groupadd -r nodeapp && useradd -r -g nodeapp nodeapp

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=build /app/dist ./dist

# Ensure files are owned by non-root user
RUN chown -R nodeapp:nodeapp /app
USER nodeapp

ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/index.js"]
