# Working with Forms

Handling forms with the Fetch Client involves preparing FormData objects and sending them via HTTP requests. This is essential for tasks like submitting form data or uploading files.

## Submitting Form Data

This example shows how to submit form data using `FormData`.

```typescript
async function submitForm(formData: FormData) {
    const response = await http.fetch('submit-form-url', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        // Handle errors
    }
    return await response.json();
}

// Usage
const formElement = document.querySelector('form');
const formData = new FormData(formElement);
submitForm(formData);
```

## Uploading a File

Here's how to upload a file using the Fetch Client, which is common in many web applications.

```typescript
async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await http.fetch('upload-url', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        // Handle errors
    }
    return await response.json();
}
```
