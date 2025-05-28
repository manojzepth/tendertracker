# Frontend Migration: Supabase SDK to Express.js API

## Introduction

This document provides guidelines and examples for refactoring the frontend application. The goal is to transition from using the Supabase SDK for backend operations to interacting with the newly created Express.js backend API.

## 1. Removing Supabase SDK

The first step is to decouple the frontend from Supabase.

*   **Remove Supabase Package:**
    *   Delete `@supabase/supabase-js` from your `dependencies` (or `devDependencies`) in `package.json`.
    *   Uninstall the package by running `npm uninstall @supabase/supabase-js` or `yarn remove @supabase/supabase-js`.
*   **Remove Supabase Client Initialization:**
    *   Locate and remove the code where the Supabase client is initialized (e.g., `createClient(SUPABASE_URL, SUPABASE_ANON_KEY)`). This is often found in a utility file or at the root of your application.

## 2. Configuring API Base URL

To easily manage and update the backend endpoint, define a base URL for your API calls.

*   Create a configuration file (e.g., `src/config.js`) or use environment variables.
*   The default base URL for the Express API (if running locally on port 3000 and routes are prefixed with `/api`) will be `http://localhost:3000/api`.

**Example (`src/config.js`):**

```javascript
// src/config.js
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
```

Ensure your build process or environment setup can handle `process.env.REACT_APP_API_BASE_URL` if you plan to use environment variables.

## 3. Authentication Flow

The authentication process will now involve direct API calls to the Express backend.

### Registration

To register a new user, make a POST request to `/auth/register`.

**Example Function:**

```javascript
// src/services/authService.js
import { API_BASE_URL } from '../config';

export const registerUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // data.message will contain the error from the backend
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    // Registration successful, data might include a success message and user info (excluding password)
    console.log('Registration successful:', data);
    return data; 
  } catch (error) {
    console.error('Registration failed:', error);
    throw error; // Re-throw to be caught by the calling component
  }
};
```

### Login

To log in, make a POST request to `/auth/login`. On success, the backend will return a JWT.

**Example Function:**

```javascript
// src/services/authService.js
import { API_BASE_URL } from '../config';

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    // Login successful, data contains the JWT and user info
    if (data.token) {
      // Store the JWT
      localStorage.setItem('jwtToken', data.token); 
      // You might also want to store user info in your app's state
      console.log('Login successful:', data.user);
      return data; 
    } else {
      throw new Error('Login failed: No token received.');
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

**Security Note on Storing JWTs:**
Storing JWTs in `localStorage` is convenient but makes the token accessible via JavaScript, potentially exposing it to Cross-Site Scripting (XSS) attacks. If your application requires higher security, consider implementing HttpOnly cookies for token storage. This approach requires backend cooperation to set the cookie upon login and is not covered by the current Express API setup.

### Storing and Using the JWT

The JWT received upon login must be sent with subsequent requests to protected backend routes.

*   **Retrieving the JWT:**
    ```javascript
    const getToken = () => localStorage.getItem('jwtToken');
    ```

*   **Adding JWT to `Authorization` Header:**
    The token should be included in the `Authorization` header using the `Bearer` scheme.
    `Authorization: Bearer <your_jwt_token>`

*   **API Utility Function (Example):**
    It's good practice to create a utility function or an API client (like an Axios instance) that automatically attaches the token.

    ```javascript
    // src/services/apiClient.js
    import { API_BASE_URL } from '../config';

    const getToken = () => localStorage.getItem('jwtToken');

    export const fetchWithAuth = async (endpoint, options = {}) => {
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers, // Allow overriding/adding headers
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Auto-handle token expiration or invalid token (optional)
      if (response.status === 401) {
        // Token might be expired or invalid, attempt to logout or refresh token
        console.error('Unauthorized access or token expired. Logging out.');
        logoutUser(); // You'll need to implement this
        // Potentially redirect to login page
        window.location.href = '/login'; 
        throw new Error('Unauthorized');
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      return data;
    };

    // Example usage:
    // const items = await fetchWithAuth('/items');
    // const newItem = await fetchWithAuth('/items', { method: 'POST', body: JSON.stringify({ name: 'Test' }) });
    ```

### Logout

Client-side logout primarily means removing the stored JWT.

```javascript
// src/services/authService.js

export const logoutUser = () => {
  localStorage.removeItem('jwtToken');
  // Clear any user state in your application (e.g., Zustand, Redux, Context API)
  console.log('User logged out.');
  // Optionally, redirect to login page or home page
  // window.location.href = '/login';
};
```

**Optional Backend Invalidation:** The current Express API does not implement a token denylist. For enhanced security, a backend route could be added to invalidate tokens upon logout, but this is a more advanced feature.

## 4. Data Fetching (CRUD Examples for `/api/items`)

The Express backend provides CRUD endpoints for an `items` resource. All these routes are protected and require a valid JWT. Use the `fetchWithAuth` utility (or a similar setup) for these calls.

### Create Item (POST /items)

```javascript
// src/services/itemService.js
import { fetchWithAuth } from './apiClient';

export const createItem = async (itemData) => {
  // itemData should be an object, e.g., { name: "My Item", description: "Details..." }
  try {
    const newItem = await fetchWithAuth('/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
    console.log('Item created:', newItem);
    return newItem;
  } catch (error) {
    console.error('Failed to create item:', error);
    throw error;
  }
};
```

### Read Items (GET /items)

```javascript
// src/services/itemService.js
import { fetchWithAuth } from './apiClient';

export const getUserItems = async () => {
  try {
    const items = await fetchWithAuth('/items');
    console.log('Fetched items:', items);
    return items;
  } catch (error) {
    console.error('Failed to fetch items:', error);
    throw error;
  }
};
```

### Update Item (PUT /items/:itemId)

```javascript
// src/services/itemService.js
import { fetchWithAuth } from './apiClient';

export const updateItem = async (itemId, updateData) => {
  // updateData should be an object with fields to update, e.g., { name: "Updated Name" }
  try {
    const updatedItem = await fetchWithAuth(`/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    console.log('Item updated:', updatedItem);
    return updatedItem;
  } catch (error) {
    console.error('Failed to update item:', error);
    throw error;
  }
};
```

### Delete Item (DELETE /items/:itemId)

```javascript
// src/services/itemService.js
import { fetchWithAuth } from './apiClient';

export const deleteItem = async (itemId) => {
  try {
    // The fetchWithAuth needs a slight modification for 204 No Content responses
    // Or handle it directly here:
    const token = localStorage.getItem('jwtToken'); // Or your getToken() function
    const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
        console.error('Unauthorized access or token expired. Logging out.');
        logoutUser(); 
        window.location.href = '/login'; 
        throw new Error('Unauthorized');
    }

    if (!response.ok && response.status !== 204) { // 204 is a success for DELETE
      const errorData = await response.json(); // Try to parse error if not 204
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    if (response.status === 204) {
        console.log('Item deleted successfully.');
        return { message: 'Item deleted successfully' }; // Or just return true
    }
    // If backend returns JSON on delete (not typical for 204), parse it:
    // return await response.json(); 
    
  } catch (error) {
    console.error('Failed to delete item:', error);
    throw error;
  }
};
```
*(Note: The `fetchWithAuth` utility might need adjustment for DELETE requests if the backend returns 204 No Content, as `.json()` will fail on an empty response. The example above shows a more direct `fetch` for DELETE, or you can modify `fetchWithAuth` to handle empty responses for certain status codes.)*

## 5. Error Handling

Proper error handling is crucial for a good user experience.

*   **Check HTTP Status Codes:** The backend uses standard HTTP status codes:
    *   `200 OK`: Successful GET, PUT.
    *   `201 Created`: Successful POST.
    *   `204 No Content`: Successful DELETE.
    *   `400 Bad Request`: Invalid input (e.g., missing fields, invalid email format). The response body will usually contain a `message` field.
    *   `401 Unauthorized`: Missing, invalid, or expired JWT.
    *   `403 Forbidden`: User is authenticated but not authorized to perform the action (not heavily used in current item CRUD, but good to be aware of).
    *   `404 Not Found`: Resource not found (e.g., trying to GET/PUT/DELETE an item that doesn't exist or doesn't belong to the user).
    *   `409 Conflict`: User already exists during registration.
    *   `500 Internal Server Error`: A generic server-side error.
*   **Parse Error Messages:** The backend API generally returns JSON objects for errors, including a `message` property. Your frontend should parse this message and display it appropriately.
    ```javascript
    // Inside a catch block
    if (error.response) { // If using Axios or similar that puts response in error object
      console.error('API Error:', error.response.data.message);
      // Display error.response.data.message to the user
    } else {
      console.error('Network or other error:', error.message);
      // Display error.message
    }
    ```

## 6. General Tips

*   **Service Modules:** Organize your API call functions into dedicated service modules (e.g., `authService.js`, `itemService.js`). This improves code organization and reusability.
*   **State Management:** Update your frontend state management (e.g., Context API, Zustand, Redux, Recoil) to reflect the new data flow. For example, store user information and authentication status globally.
*   **UI Components:** Review and update UI components to use the new service functions for data fetching and mutations. Remove any Supabase-specific UI elements or logic.
*   **Thorough Testing:** After refactoring, test all aspects of the frontend application, especially authentication and data operations, to ensure everything works as expected with the new backend.

This migration is a significant change. Proceed methodically, test frequently, and refer to the Express API's route definitions and expected request/response formats as needed.
```
