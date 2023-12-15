# Handling Different Response Types

The Aurelia Fetch Client can handle various response types, including JSON, Blob, and text. Proper handling of these types is crucial for correctly processing server responses.

## Handling JSON Response

This example demonstrates how to fetch and process a JSON response.

```typescript
async function fetchJson(url: string) {
    const response = await http.fetch(URL);
    if (response.ok) {
        return await response.json();
    } else {
        // Handle errors
    }
}
```

## Handling Blob (Binary Data)

This snippet shows how to handle binary data (like images or files) received from the server.

```typescript
async function fetchBlob(URL: string) {
    const response = await http.fetch(URL);
    if (response.ok) {
        return await response.blob();
    } else {
        // Handle errors
    }
}
```

## Response Transformation and Mapping

This interceptor transforms JSON responses using a custom transformData function, allowing for consistent data shaping across the application.

```typescript
http.configure(config => {
    config.withInterceptor({
        async response(response) {
            if (response.ok && response.headers.get('Content-Type')?.includes('application/json')) {
                const data = await response.json();
                return transformData(data); // Custom transformation function
            }
            return response;
        }
    });
});

function transformData(data) {
    // Transformation logic
    return modifiedData;
}
```
