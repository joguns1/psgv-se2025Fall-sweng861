# Build
FROM node:18-alpine AS build
WORKDIR /app
COPY ../../week5/frontend/package*.json ./
RUN npm ci
COPY ../../week5/frontend ./
# REACT_APP_API_BASE should come from CI (GitHub secret)
ARG REACT_APP_API_BASE
ENV REACT_APP_API_BASE=$REACT_APP_API_BASE
RUN npm run build

# Serve
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
