# Response Types and Data Handling

The Aurelia Fetch Client provides comprehensive support for all standard response types and data formats. Understanding how to properly handle different response types is crucial for building robust applications that work with various APIs and data sources.

## Response Type Detection

The fetch client automatically handles content-type detection, but you should always check response headers and status codes for proper error handling:

```typescript
import { IHttpClient } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

export class ApiService {
  private http = resolve(IHttpClient);

  async fetchWithTypeDetection(url: string) {
    const response = await this.http.get(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType.includes('text/')) {
      return await response.text();
    } else if (contentType.includes('image/') || contentType.includes('application/octet-stream')) {
      return await response.blob();
    } else {
      return await response.arrayBuffer();
    }
  }
}
```

## JSON Responses

JSON is the most common response type for modern APIs. Always include proper error handling and type safety:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

export class UserService {
  private http = resolve(IHttpClient);

  async getUser(id: number): Promise<User> {
    try {
      const response = await this.http.get(`/api/users/${id}`);
      
      if (!response.ok) {
        // Handle different error types
        if (response.status === 404) {
          throw new Error('User not found');
        } else if (response.status >= 500) {
          throw new Error('Server error - please try again later');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
      }

      const userData = await response.json();
      return userData as User;
    } catch (error) {
      if (error instanceof TypeError) {
        // Network error
        throw new Error('Network error - please check your connection');
      }
      throw error;
    }
  }

  async getUsers(): Promise<User[]> {
    const response = await this.http.get('/api/users');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return await response.json();
  }
}
```

## Binary Data (Images, Files, Documents)

Handle binary data like images, PDFs, and other files using Blob responses:

```typescript
export class FileService {
  private http = resolve(IHttpClient);

  async downloadFile(fileId: string): Promise<{ blob: Blob; filename: string }> {
    const response = await this.http.get(`/api/files/${fileId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const blob = await response.blob();
    
    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : `file-${fileId}`;

    return { blob, filename };
  }

  async downloadImage(imageId: string): Promise<string> {
    const response = await this.http.get(`/api/images/${imageId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const blob = await response.blob();
    
    // Create object URL for display
    return URL.createObjectURL(blob);
  }

  async uploadImage(file: File): Promise<{ id: string; url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await this.http.post('/api/images', {
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  }
}
```

## Text Responses

Handle plain text, HTML, CSV, and other text-based responses:

```typescript
export class ContentService {
  private http = resolve(IHttpClient);

  async getPlainText(url: string): Promise<string> {
    const response = await this.http.get(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch text: ${response.statusText}`);
    }

    return await response.text();
  }

  async getHtmlContent(pageId: string): Promise<string> {
    const response = await this.http.get(`/api/pages/${pageId}`, {
      headers: { 'Accept': 'text/html' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch HTML: ${response.statusText}`);
    }

    return await response.text();
  }

  async exportCsv(reportId: string): Promise<string> {
    const response = await this.http.get(`/api/reports/${reportId}/export`, {
      headers: { 'Accept': 'text/csv' }
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return await response.text();
  }
}
```

## ArrayBuffer for Raw Binary Data

Use ArrayBuffer for handling raw binary data that needs processing:

```typescript
export class BinaryDataService {
  private http = resolve(IHttpClient);

  async getRawBinaryData(url: string): Promise<ArrayBuffer> {
    const response = await this.http.get(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch binary data: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  }

  async processImageData(imageId: string): Promise<Uint8Array> {
    const response = await this.http.get(`/api/images/${imageId}/raw`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image data: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }
}
```

## Streaming Responses

Handle large responses using streams for better memory efficiency:

```typescript
export class StreamingService {
  private http = resolve(IHttpClient);

  async processLargeDataset(datasetId: string, onChunk: (chunk: any) => void): Promise<void> {
    const response = await this.http.get(`/api/datasets/${datasetId}/stream`);
    
    if (!response.ok) {
      throw new Error(`Stream failed: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is not readable');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const chunk = JSON.parse(line);
              onChunk(chunk);
            } catch (error) {
              console.warn('Failed to parse chunk:', line);
            }
          }
        }
      }

      // Process final buffer content
      if (buffer.trim()) {
        try {
          const chunk = JSON.parse(buffer);
          onChunk(chunk);
        } catch (error) {
          console.warn('Failed to parse final chunk:', buffer);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async downloadWithProgress(
    url: string, 
    onProgress: (loaded: number, total: number) => void
  ): Promise<Blob> {
    const response = await this.http.get(url);
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is not readable');
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        chunks.push(value);
        loaded += value.length;
        
        if (total > 0) {
          onProgress(loaded, total);
        }
      }
    } finally {
      reader.releaseLock();
    }

    return new Blob(chunks);
  }
}
```

## Response Transformation with Interceptors

Use interceptors to transform responses globally or conditionally:

```typescript
export class DataTransformService {
  private http = resolve(IHttpClient);

  constructor() {
    this.setupResponseTransformers();
  }

  private setupResponseTransformers() {
    this.http.configure(config => config.withInterceptor({
      async response(response, request) {
        // Transform API responses based on content type and URL
        const contentType = response.headers.get('content-type') || '';
        const url = new URL(response.url);

        if (contentType.includes('application/json')) {
          // Transform JSON responses
          if (url.pathname.startsWith('/api/v1/')) {
            return this.transformV1Response(response);
          } else if (url.pathname.startsWith('/api/legacy/')) {
            return this.transformLegacyResponse(response);
          }
        }

        return response;
      }
    }));
  }

  private async transformV1Response(response: Response): Promise<Response> {
    const data = await response.json();
    
    // Transform V1 API structure to internal format
    const transformedData = {
      ...data,
      timestamp: new Date(data.created_at),
      metadata: {
        version: 'v1',
        source: 'api'
      }
    };

    return new Response(JSON.stringify(transformedData), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }

  private async transformLegacyResponse(response: Response): Promise<Response> {
    const data = await response.json();
    
    // Transform legacy API structure
    const transformedData = {
      id: data.ID,
      name: data.Name,
      status: data.Status?.toLowerCase(),
      createdAt: new Date(data.CreateTime),
      metadata: {
        version: 'legacy',
        source: 'legacy-api'
      }
    };

    return new Response(JSON.stringify(transformedData), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }
}
```

## Error Response Handling

Properly handle different types of error responses:

```typescript
export class ErrorHandlingService {
  private http = resolve(IHttpClient);

  constructor() {
    this.http.configure(config => config
      .rejectErrorResponses()
      .withInterceptor({
        async responseError(error, request) {
          if (error instanceof Response) {
            return this.handleHttpError(error, request);
          } else {
            return this.handleNetworkError(error, request);
          }
        }
      })
    );
  }

  private async handleHttpError(response: Response, request?: Request): Promise<never> {
    const contentType = response.headers.get('content-type') || '';
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorDetails: any = {};

    try {
      if (contentType.includes('application/json')) {
        errorDetails = await response.json();
        errorMessage = errorDetails.message || errorDetails.error || errorMessage;
      } else if (contentType.includes('text/')) {
        const textError = await response.text();
        errorMessage = textError || errorMessage;
      }
    } catch (parseError) {
      // If we can't parse the error response, use the default message
    }

    const error = new Error(errorMessage);
    (error as any).status = response.status;
    (error as any).details = errorDetails;
    (error as any).url = request?.url;

    throw error;
  }

  private handleNetworkError(error: any, request?: Request): never {
    const networkError = new Error(`Network error: ${error.message}`);
    (networkError as any).originalError = error;
    (networkError as any).url = request?.url;
    (networkError as any).isNetworkError = true;

    throw networkError;
  }
}
```

## Best Practices

### Content-Type Validation
Always check content-type headers before processing responses:

```typescript
const contentType = response.headers.get('content-type');
if (!contentType?.includes('application/json')) {
  throw new Error('Expected JSON response');
}
```

### Memory Management
For large responses, use streaming or dispose of object URLs:

```typescript
// For blob URLs, clean up when done
const blobUrl = URL.createObjectURL(blob);
// ... use the URL
URL.revokeObjectURL(blobUrl); // Clean up
```

### Type Safety
Use TypeScript interfaces for JSON responses:

```typescript
interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

const response: ApiResponse<User[]> = await response.json();
```

### Error Boundaries
Always wrap response processing in try-catch blocks and handle different error types appropriately.
