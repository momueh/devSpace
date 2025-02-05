/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SettingsImport } from './routes/settings'
import { Route as MyDevspaceImport } from './routes/my-devspace'
import { Route as IndexImport } from './routes/index'
import { Route as ProjectProjectIdImport } from './routes/project.$projectId'

// Create/Update Routes

const SettingsRoute = SettingsImport.update({
  id: '/settings',
  path: '/settings',
  getParentRoute: () => rootRoute,
} as any)

const MyDevspaceRoute = MyDevspaceImport.update({
  id: '/my-devspace',
  path: '/my-devspace',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const ProjectProjectIdRoute = ProjectProjectIdImport.update({
  id: '/project/$projectId',
  path: '/project/$projectId',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/my-devspace': {
      id: '/my-devspace'
      path: '/my-devspace'
      fullPath: '/my-devspace'
      preLoaderRoute: typeof MyDevspaceImport
      parentRoute: typeof rootRoute
    }
    '/settings': {
      id: '/settings'
      path: '/settings'
      fullPath: '/settings'
      preLoaderRoute: typeof SettingsImport
      parentRoute: typeof rootRoute
    }
    '/project/$projectId': {
      id: '/project/$projectId'
      path: '/project/$projectId'
      fullPath: '/project/$projectId'
      preLoaderRoute: typeof ProjectProjectIdImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/my-devspace': typeof MyDevspaceRoute
  '/settings': typeof SettingsRoute
  '/project/$projectId': typeof ProjectProjectIdRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/my-devspace': typeof MyDevspaceRoute
  '/settings': typeof SettingsRoute
  '/project/$projectId': typeof ProjectProjectIdRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/my-devspace': typeof MyDevspaceRoute
  '/settings': typeof SettingsRoute
  '/project/$projectId': typeof ProjectProjectIdRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/my-devspace' | '/settings' | '/project/$projectId'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/my-devspace' | '/settings' | '/project/$projectId'
  id: '__root__' | '/' | '/my-devspace' | '/settings' | '/project/$projectId'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  MyDevspaceRoute: typeof MyDevspaceRoute
  SettingsRoute: typeof SettingsRoute
  ProjectProjectIdRoute: typeof ProjectProjectIdRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  MyDevspaceRoute: MyDevspaceRoute,
  SettingsRoute: SettingsRoute,
  ProjectProjectIdRoute: ProjectProjectIdRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/my-devspace",
        "/settings",
        "/project/$projectId"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/my-devspace": {
      "filePath": "my-devspace.tsx"
    },
    "/settings": {
      "filePath": "settings.tsx"
    },
    "/project/$projectId": {
      "filePath": "project.$projectId.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
