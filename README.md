# ArchiteX

Currently a work in progress. Integration is underway and should be completed soon.

ArchiteX is a full-stack starter project that combines a C# CleanArchitecture backend with a Next.js frontend (using pnpm) and optional mobile projects (Expo and Flutter). This template comes preconfigured with built-in authentication, database integration, and a modular project structure, enabling you to rapidly kickstart new projects with best practices already in place.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Features

- **CleanArchitecture Backend:**  
  Implements a robust, modular C# solution with clear separation between Domain, Application, Infrastructure, and Presentation layers.
- **Next.js / Shadcn UI Frontend:**  
  A modern, fast frontend built with Next.js/Shadcn UI and managed with pnpm.
- **Built-in Authentication:**  
  Pre-configured authentication modules to secure your application right out of the box.
- **Database Integration:**  
  Support for multiple database options (SQL Server, PostgreSQL, SQLite, etc.) through conditional configuration.
- **Optional Mobile Support:**  
  Ready-made directories for Expo-based and Flutter-based mobile apps to extend your project’s reach.
- **Docker-Ready:**  
  Includes Docker Compose configurations for simplified local development and testing.

## Project Structure

## Usage

### Requirements

- dotnet 9.0.101
- node <=20 (23 used in this template)
- pnpm 10.3.0
- fnm 1.38.1

```bash
brew install fnm dotnet pnpm # or yarn
fnm install 23
fnm default 23 # or fnm use 23
```

### Local Development Environment Configuration

#### Host File Configuration

To facilitate local development and testing, please add the following entries to your host file. This configuration allows seamless interaction between your local frontend and the Docker-containerized API through a proxy, all within your local network.

Edit your host file using the following command:

`sudo nano /etc/hosts`

```hosts
127.0.0.1 architex-frontend-local.mydom.com
127.0.0.1 architex-backend-local.mydom.com
{docker-server.local.ip} architex-frontend.mydom.com
{docker-server.local.ip} architex-backend.mydom.com
```

Replace `{docker-server.local.ip}` with the actual IP address of your Docker server on the local network.

#### Benefits

This configuration offers several advantages:

1. Local Frontend and API Interaction: Enables testing of your local frontend with the internal Docker container API.
2. Proxy Setup: Utilizes a proxy setup for enhanced security and performance.
3. Local Network Traffic: Keeps all traffic within the local network.
4. Production-Like Environment: Ensures proper functionality, including cookie handling, in a production-like environment.

By implementing this setup, you can confidently develop and test your application, simulating real-world conditions without exposing your development environment to external networks.

### From within root directory

```bash
pnpm -C frontend run dev
dotnet run --project backend/src/Web/Web.csproj
```

### From within backend directory

```bash
dotnet run --project Web/Web.csproj
```

### From within frontend directory

```bash
pnpm run dev
```

### Docker

```bash
docker build -t architex_frontend:v1 .
docker run -d -p 3342:3342 --name my_architex_frontend_v1 architex_frontend:v1
```

### Roadmap

Current Work
• Authentication Integration: Implementing authentication between Next.js frontend and C# backend.

### Acknowledgments & Code Theft🥷🏻 / Sharing (Because Sharing is Caring)

I'm grateful to the open-source community for making it easy to "borrow" great ideas. This project wouldn't be possible without the amazing work of others. You can find links to all the projects that inspired me below.

- [Jason Taylor's CleanArchitecture](https://github.com/jasontaylordev/CleanArchitecture)
- [WebDevSimplified](https://github.com/WebDevSimplified)
- [Shadcn UI](https://ui.shadcn.com/)
- [Next.js](https://nextjs.org/)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/)

#### Concrete Tutorials

- [nextsolution](https://github.com/prince272/nextsolution)
- [WebDevSimplified/course-platform](https://github.com/WebDevSimplified/course-platform)
- [Build A Course Platform LMS With Next.js 15, React 19, Stripe, Drizzle, Shadcn, Postgres](https://www.youtube.com/watch?v=OAyQ3Wyyzfg)

#### Temp notes

```bash
dotnet tool install --global dotnet-ef --version 9.*
dotnet ef database update --project src/Infrastructure --startup-project src/Web
dotnet ef migrations add "SampleMigration" --project src\Infrastructure --startup-project src\Web --output-dir Data\Migrations
```

### Shadcn Components update

```bash
pnpm dlx shadcn diff # check for changes
pnpm dlx shadcn@latest add -y -o button # or any other component

# Script to update all components
for file in src/components/ui/*.tsx; do
  pnpm dlx shadcn@latest add -y -o $(basename "$file" .tsx)
done
```

IMPORTANT: you can not use SameSiteMode.None without HTTPS
For aspnet oauth2 local testing you have to add 127.0.0.1 architex-api.mydom.com to your hosts file and using this as the base url for your api.
Test it with http://architex-api.mydom.com:5141/api/index.html?url=/api/specification.json
.env => NEXT_PUBLIC_API_BASE_URL=http://architex-api.mydom.com:5141

Authorized JavaScript origins:
http://architex-api.mydom.com:5141

Authorized redirect URIs:
http://architex-api.mydom.com:5141/api/Users/sign-in/google/callback

#### Strange errors

When making db changes, you may need to comment await app.InitialiseDatabaseAsync(); in Program.cs, rebuild project, run an migrations add, run database update and then uncomment await app.InitialiseDatabaseAsync(); in Program.cs.
