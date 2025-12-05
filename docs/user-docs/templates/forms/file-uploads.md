# File Uploads

Learn how to handle file inputs and uploads in Aurelia forms.

## Basic File Input

```html
<form>
  <label for="fileUpload">Select files to upload:</label>
  <input
    id="fileUpload"
    type="file"
    multiple
    accept="image/*"
    change.trigger="handleFileSelect($event)" />

  <button
    click.trigger="uploadFiles()"
    disabled.bind="!selectedFiles.length">
    Upload
  </button>
</form>
```

```typescript
export class FileUploadComponent {
  selectedFiles: File[] = [];

  handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.selectedFiles = Array.from(input.files);
  }

  async uploadFiles() {
    if (this.selectedFiles.length === 0) return;

    const formData = new FormData();
    for (const file of this.selectedFiles) {
      formData.append('files', file, file.name);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      this.selectedFiles = [];
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  }
}
```

## Single File Upload

```html
<input type="file" accept="image/*" change.trigger="handleFileSelect($event)" />
```

```typescript
handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  this.selectedFiles = input.files?.length ? [input.files[0]] : [];
}
```

## File Preview

```typescript
export class FilePreviewComponent {
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.selectedFile = file;
      this.createPreview(file);
    }
  }

  private createPreview(file: File) {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.previewUrl = URL.createObjectURL(file);
  }

  detaching() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }
}
```

```html
<input type="file" accept="image/*" change.trigger="handleFileSelect($event)" />

<div if.bind="previewUrl" class="preview">
  <img src.bind="previewUrl" alt="Preview" />
  <p>${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)</p>
</div>
```

## Validation

```typescript
export class ValidatedFileUpload {
  selectedFile: File | null = null;
  error: string | null = null;

  maxSize = 5 * 1024 * 1024; // 5MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

  handleFileSelect(event: Event) {
    this.error = null;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!this.allowedTypes.includes(file.type)) {
      this.error = 'Only JPEG, PNG, and GIF images are allowed';
      input.value = '';
      return;
    }

    if (file.size > this.maxSize) {
      this.error = `File size must be less than ${this.maxSize / (1024 * 1024)}MB`;
      input.value = '';
      return;
    }

    this.selectedFile = file;
  }
}
```

## Progress Tracking

```typescript
export class FileUploadWithProgress {
  uploadProgress = 0;
  isUploading = false;

  async uploadWithProgress(file: File) {
    this.isUploading = true;
    this.uploadProgress = 0;

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          this.uploadProgress = (e.loaded / e.total) * 100;
        }
      });

      xhr.addEventListener('load', () => {
        this.isUploading = false;
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        this.isUploading = false;
        reject(new Error('Upload failed'));
      });

      const formData = new FormData();
      formData.append('file', file);

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  }
}
```

```html
<input type="file" change.trigger="handleFileSelect($event)" />

<div if.bind="isUploading" class="progress">
  <div class="progress-bar" css="width: ${uploadProgress}%"></div>
  <span>${uploadProgress.toFixed(0)}%</span>
</div>
```

## Best Practices

1. **Validate on both client and server** - Always verify file types and sizes server-side
2. **Clean up object URLs** - Revoke object URLs in `detaching()` to prevent memory leaks
3. **Show progress for large files** - Use XMLHttpRequest for progress tracking
4. **Provide clear feedback** - Show file names, sizes, and upload status
5. **Handle errors gracefully** - Display meaningful error messages

## Security Considerations

- Validate file types server-side (don't trust `accept` attribute)
- Check file sizes to prevent DoS attacks
- Scan uploaded files for malware
- Store files outside web root
- Use unique filenames to prevent overwrites
- Implement rate limiting

## Related

- [Form Basics](README.md)
- [Form Submission](submission.md)
- [Form Examples](examples.md)
