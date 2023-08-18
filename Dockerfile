# Use the specified node version
FROM node:18
# Set the working directory
WORKDIR /app
# Copy the entire project
COPY . .
# Install dependencies using yarn
RUN yarn install
# Build the TypeScript code
RUN yarn build
# Expose the necessary port
EXPOSE 8000
# Start the Fastify server
CMD ["yarn", "start"]