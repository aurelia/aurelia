# Working with Forms and File Uploads

Form handling is a critical aspect of web applications. The Aurelia Fetch Client provides comprehensive support for various form submission methods, file uploads, and advanced form processing scenarios.

## Form Data Submission

### Basic Form Submission with FormData

```typescript
import { IHttpClient } from '@aurelia/fetch-client';
import { resolve } from '@aurelia/kernel';

export class FormService {
  private http = resolve(IHttpClient);

  async submitForm(formElement: HTMLFormElement): Promise<any> {
    const formData = new FormData(formElement);
    
    try {
      const response = await this.http.post('/api/forms/submit', {
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Form submission failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    }
  }

  async submitFormData(data: Record<string, any>): Promise<any> {
    const formData = new FormData();
    
    // Add form fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File || value instanceof Blob) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach(item => formData.append(`${key}[]`, item));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await this.http.post('/api/forms/data', {
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Form submission failed: ${response.statusText}`);
    }

    return await response.json();
  }
}
```

### URL-Encoded Form Submission

For traditional form submissions that don't involve file uploads:

```typescript
export class UrlEncodedFormService {
  private http = resolve(IHttpClient);

  async submitUrlEncodedForm(data: Record<string, string | number | boolean>): Promise<any> {
    const params = new URLSearchParams();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, String(value));
      }
    });

    const response = await this.http.post('/api/forms/urlencoded', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error(`Form submission failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async loginUser(username: string, password: string): Promise<{ token: string; user: any }> {
    return this.submitUrlEncodedForm({
      username,
      password,
      grant_type: 'password'
    });
  }
}
```

## File Upload Operations

### Single File Upload

```typescript
export class FileUploadService {
  private http = resolve(IHttpClient);

  async uploadSingleFile(
    file: File, 
    additionalData?: Record<string, any>
  ): Promise<{ id: string; url: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('originalName', file.name);
    formData.append('mimeType', file.type);
    
    // Add any additional form data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const response = await this.http.post('/api/files/upload', {
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async uploadProfileImage(file: File, userId: string): Promise<{ profileImageUrl: string }> {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    return this.uploadSingleFile(file, { userId, type: 'profile' });
  }
}
```

### Multiple File Upload

```typescript
export class MultiFileUploadService {
  private http = resolve(IHttpClient);

  async uploadMultipleFiles(
    files: FileList | File[],
    onProgress?: (loaded: number, total: number) => void
  ): Promise<Array<{ id: string; name: string; url: string }>> {
    const formData = new FormData();
    const fileArray = Array.from(files);
    
    fileArray.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
      formData.append(`names[${index}]`, file.name);
    });

    // Add metadata
    formData.append('fileCount', String(fileArray.length));
    formData.append('uploadTimestamp', new Date().toISOString());

    const response = await this.http.post('/api/files/upload-multiple', {
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Multi-file upload failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async uploadDocuments(files: FileList): Promise<any> {
    // Filter for document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    const validFiles = Array.from(files).filter(file => 
      allowedTypes.includes(file.type)
    );

    if (validFiles.length === 0) {
      throw new Error('No valid document files selected');
    }

    return this.uploadMultipleFiles(validFiles);
  }
}
```

### Upload with Progress Tracking

```typescript
export class ProgressUploadService {
  private http = resolve(IHttpClient);

  async uploadWithProgress(
    file: File,
    onProgress: (percentage: number, loaded: number, total: number) => void,
    onComplete: (result: any) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);

    try {
      // Note: Native fetch doesn't support upload progress directly
      // This example shows the pattern, but you might need XMLHttpRequest for true upload progress
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          onProgress(percentage, event.loaded, event.total);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          onComplete(result);
        } else {
          onError(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        onError(new Error('Upload failed due to network error'));
      });

      xhr.open('POST', '/api/files/upload-progress');
      xhr.send(formData);

    } catch (error) {
      onError(error as Error);
    }
  }

  // Alternative approach using fetch with chunked upload for progress
  async uploadFileChunked(
    file: File,
    onProgress: (percentage: number) => void
  ): Promise<any> {
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uploadId = this.generateUploadId();

    try {
      // Initialize upload
      await this.http.post('/api/files/upload/init', {
        body: JSON.stringify({
          uploadId,
          filename: file.name,
          fileSize: file.size,
          totalChunks
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      // Upload chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('uploadId', uploadId);
        formData.append('chunkIndex', String(chunkIndex));
        formData.append('chunk', chunk);

        await this.http.post('/api/files/upload/chunk', {
          body: formData
        });

        const percentage = Math.round(((chunkIndex + 1) / totalChunks) * 100);
        onProgress(percentage);
      }

      // Finalize upload
      const response = await this.http.post('/api/files/upload/finalize', {
        body: JSON.stringify({ uploadId }),
        headers: { 'Content-Type': 'application/json' }
      });

      return await response.json();

    } catch (error) {
      // Cleanup on error
      await this.http.delete(`/api/files/upload/${uploadId}`).catch(() => {});
      throw error;
    }
  }

  private generateUploadId(): string {
    return `upload-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }
}
```

## Advanced Form Handling

### Form Validation Integration

```typescript
interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export class ValidatedFormService {
  private http = resolve(IHttpClient);

  async submitWithValidation(formData: FormData): Promise<any> {
    try {
      const response = await this.http.post('/api/forms/validated', {
        body: formData
      });

      if (!response.ok) {
        if (response.status === 422) {
          // Validation errors
          const validationErrors: ValidationError[] = await response.json();
          throw new ValidationError('Form validation failed', validationErrors);
        }
        throw new Error(`Form submission failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ValidationError) {
        this.handleValidationErrors(error.errors);
      }
      throw error;
    }
  }

  private handleValidationErrors(errors: ValidationError[]): void {
    errors.forEach(error => {
      const field = document.querySelector(`[name="${error.field}"]`);
      if (field) {
        field.classList.add('error');
        
        // Add error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = error.message;
        field.parentElement?.appendChild(errorElement);
      }
    });
  }
}

class ValidationError extends Error {
  constructor(message: string, public errors: ValidationError[]) {
    super(message);
  }
}
```

### Dynamic Form Building

```typescript
export class DynamicFormService {
  private http = resolve(IHttpClient);

  async submitDynamicForm(formConfig: any, values: Record<string, any>): Promise<any> {
    const formData = new FormData();
    
    // Process form fields based on configuration
    formConfig.fields.forEach((field: any) => {
      const value = values[field.name];
      
      if (value !== null && value !== undefined) {
        switch (field.type) {
          case 'file':
            if (value instanceof File) {
              formData.append(field.name, value);
            }
            break;
          case 'array':
            if (Array.isArray(value)) {
              value.forEach(item => formData.append(`${field.name}[]`, item));
            }
            break;
          case 'json':
            formData.append(field.name, JSON.stringify(value));
            break;
          default:
            formData.append(field.name, String(value));
        }
      }
    });

    // Add form metadata
    formData.append('_formType', formConfig.type);
    formData.append('_version', formConfig.version);

    const response = await this.http.post('/api/forms/dynamic', {
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Dynamic form submission failed: ${response.statusText}`);
    }

    return await response.json();
  }
}
```

### File Upload with AbortController

```typescript
export class AbortableUploadService {
  private http = resolve(IHttpClient);

  async uploadWithCancellation(
    file: File,
    onProgress?: (percentage: number) => void
  ): Promise<{ result: any; abort: () => void }> {
    const controller = new AbortController();
    const formData = new FormData();
    formData.append('file', file);

    const uploadPromise = this.http.post('/api/files/upload', {
      body: formData,
      signal: controller.signal
    }).then(response => {
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      return response.json();
    });

    return {
      result: uploadPromise,
      abort: () => controller.abort()
    };
  }

  async uploadMultipleWithCancellation(
    files: File[]
  ): Promise<{ results: Promise<any>[]; abortAll: () => void }> {
    const controllers = files.map(() => new AbortController());
    
    const uploadPromises = files.map((file, index) => {
      const formData = new FormData();
      formData.append('file', file);
      
      return this.http.post('/api/files/upload', {
        body: formData,
        signal: controllers[index].signal
      }).then(response => {
        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}: ${response.statusText}`);
        }
        return response.json();
      });
    });

    return {
      results: uploadPromises,
      abortAll: () => controllers.forEach(controller => controller.abort())
    };
  }
}
```

## Form Data Processing

### Complex Data Structures

```typescript
export class ComplexFormService {
  private http = resolve(IHttpClient);

  async submitComplexForm(data: {
    user: {
      name: string;
      email: string;
      avatar?: File;
    };
    preferences: Record<string, any>;
    documents: File[];
    metadata: any;
  }): Promise<any> {
    const formData = new FormData();

    // User data
    formData.append('user[name]', data.user.name);
    formData.append('user[email]', data.user.email);
    if (data.user.avatar) {
      formData.append('user[avatar]', data.user.avatar);
    }

    // Preferences (nested object)
    Object.entries(data.preferences).forEach(([key, value]) => {
      formData.append(`preferences[${key}]`, JSON.stringify(value));
    });

    // Multiple files
    data.documents.forEach((file, index) => {
      formData.append(`documents[${index}]`, file);
    });

    // Metadata as JSON
    formData.append('metadata', JSON.stringify(data.metadata));

    const response = await this.http.post('/api/forms/complex', {
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Complex form submission failed: ${response.statusText}`);
    }

    return await response.json();
  }
}
```

## Best Practices

### File Type and Size Validation

```typescript
export class FileValidationService {
  validateFile(file: File, options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Size validation
    if (options.maxSize && file.size > options.maxSize) {
      errors.push(`File size must be less than ${this.formatFileSize(options.maxSize)}`);
    }

    // Type validation
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Extension validation
    if (options.allowedExtensions) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !options.allowedExtensions.includes(extension)) {
        errors.push(`File extension .${extension} is not allowed`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
```

### Error Handling and Recovery

```typescript
export class RobustFormService {
  private http = resolve(IHttpClient);

  async submitWithRetry(
    formData: FormData,
    maxRetries: number = 3
  ): Promise<any> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.http.post('/api/forms/submit', {
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Form submission failed after ${maxRetries} attempts: ${lastError!.message}`);
  }
}
```

### Memory Management

Always clean up object URLs and large FormData objects when done:

```typescript
// Clean up blob URLs
const blobUrl = URL.createObjectURL(file);
// ... use the URL
URL.revokeObjectURL(blobUrl);

// For large forms, consider clearing FormData references
let formData: FormData | null = new FormData();
// ... use formData
formData = null; // Help garbage collection
```

The Aurelia Fetch Client provides a robust foundation for handling all types of form submissions and file uploads. By following these patterns, you can build reliable, user-friendly form handling in your applications.
