/**
 * Utility function to handle asset paths for different deployment scenarios
 */

declare const __BASE_PATH__: string;

/**
 * Get the correct asset path based on the build configuration
 * @param assetPath - The asset path (e.g., "assets/images/logo.png")
 * @returns The correct path for the current deployment
 */
export function getAssetPath(assetPath: string): string {
  // Remove leading slash if present
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  
  // Get base path from build configuration
  const basePath = typeof __BASE_PATH__ !== 'undefined' ? __BASE_PATH__ : '/';
  
  // Handle different base path scenarios
  if (basePath === '/') {
    // Root deployment - use absolute path
    return `/${cleanPath}`;
  } else if (basePath === './') {
    // Relative deployment - use relative path
    return cleanPath;
  } else {
    // Subdirectory deployment - combine base path with asset path
    const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
    return `${normalizedBase}${cleanPath}`;
  }
}

/**
 * Hook to get asset path in React components
 */
export function useAssetPath() {
  return getAssetPath;
}

/**
 * Get the current base path
 */
export function getBasePath(): string {
  return typeof __BASE_PATH__ !== 'undefined' ? __BASE_PATH__ : '/';
}