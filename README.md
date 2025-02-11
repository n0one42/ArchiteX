# ArchiteX

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
  
- **Next.js Frontend:**  
  A modern, fast frontend built with Next.js and managed with pnpm.
  
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

```bash
brew install fnm dotnet pnpm # or yarn
fnm install 23
fnm default 23 # or fnm use 23
```

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
