FROM oven/bun:1 as base

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install

# Copy source code
COPY . .

# Build the application
RUN bun run build

EXPOSE 5000

# Run the application
CMD ["bun", "run", "index.ts"]
