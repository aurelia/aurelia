---
description: Learn how to build a fully styled weather dashboard in Aurelia 2 with Tailwind CSS and Vite.
---

# Building a Weather Dashboard with Aurelia 2, Tailwind CSS, and Vite

Aurelia 2 provides a powerful and flexible framework for building modern web applications. By integrating **Tailwind CSS** and **Vite**, we can create a fully responsive and beautifully styled **weather dashboard** that fetches real-time weather data. This guide will walk you through setting up the project, configuring Tailwind CSS, and building the UI.

---

## Prerequisites

Ensure you have **[Node.js](https://nodejs.org/)** (latest LTS version recommended) installed.

---

## 1. Setting Up the Aurelia Project with Vite

### Create a New Aurelia Project

Run the following command to scaffold a new Aurelia 2 project using **Vite**:

```bash
npx makes aurelia
```

Select **"Default TypeScript App"** and **"Vite"** as the bundler when prompted. When you're asked for a name, make something up or use `weather-app`.

### Navigate to Your Project Directory

```bash
cd weather-app
```

---

## 2. Installing and Configuring Tailwind CSS

### Install Tailwind CSS and Its Vite Plugin

To integrate **Tailwind CSS** with **Vite**, install the required dependencies:

```bash
npm install tailwindcss @tailwindcss/vite -D
```

### Configure Vite to Use Tailwind CSS

Update your **`vite.config.ts`** to include the Tailwind CSS Vite plugin:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [aurelia(), tailwindcss()],
});
```

### Include Tailwind in Your CSS

In your scaffolded project, you'll see a `my-app.css` file. Open it and add the following:

```css
/* src/my-app.css */
@import 'tailwindcss';
```

Aurelia will automatically include this file when you run `npm start` because of the default conventions support in Aurelia projects.

---

## 3. Implementing the Weather Dashboard

### Fetching Weather Data

Sign up for a **free API key** from **[OpenWeatherMap](https://openweathermap.org/api)** to fetch real-time weather data. You get a few thousand requests per day for free.

Create a **Weather Service** to handle API requests:

```typescript
// src/services/weather-service.ts
import { resolve } from '@aurelia/kernel';
import { IHttpClient } from '@aurelia/fetch-client';

export class WeatherService {
  private http = resolve(IHttpClient);
  private apiKey = 'YOUR_API_KEY';
  private baseUrl = 'https://api.openweathermap.org/data/2.5/';

  async getWeatherByCity(city: string): Promise<any> {
    const response = await this.http.fetch(
      `${this.baseUrl}weather?q=${city}&appid=${this.apiKey}&units=metric`
    );
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('City not found');
    }
  }
}
```

---

## 4. Creating the Weather Dashboard Component

### Weather Dashboard View Model

Create a **component** that fetches weather data and manages state:

```typescript
// src/components/weather-dashboard.ts
import { ICustomElementViewModel } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';
import { WeatherService } from '../services/weather-service';

export class WeatherDashboard implements ICustomElementViewModel {
  private weatherService = resolve(WeatherService);
  public city = 'Brisbane';
  public weatherData: any = null;
  public errorMessage: string | null = null;

  async attached() {
    await this.fetchWeather();
  }

  async fetchWeather() {
    try {
      this.errorMessage = null;
      this.weatherData = await this.weatherService.getWeatherByCity(this.city);
    } catch (error) {
      this.errorMessage = error.message;
      this.weatherData = null;
    }
  }

  async search() {
    await this.fetchWeather();
  }
}
```

---

### Weather Dashboard View (HTML)

Now, style the **dashboard UI** with **Tailwind CSS**:

```html
<!-- src/components/weather-dashboard.html -->
<div class="max-w-md mx-auto p-6 bg-white shadow-xl rounded-lg">
  <h1 class="text-3xl font-bold mb-6 text-center text-blue-600">Weather Dashboard</h1>

  <form submit.trigger="search" class="flex mb-6">
    <input
      type="text"
      value.bind="city"
      placeholder="Enter city name"
      class="flex-grow p-2 border border-gray-300 rounded-l focus:ring focus:ring-blue-200"
    />
    <button
      type="submit"
      class="p-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 transition"
    >
      Search
    </button>
  </form>

  <div if.bind="errorMessage" class="text-red-500 text-center font-semibold">
    <p>${errorMessage}</p>
  </div>

  <div if.bind="weatherData" class="text-center">
    <h2 class="text-xl font-semibold text-gray-900">${weatherData.name}, ${weatherData.sys.country}</h2>
    <p class="text-gray-700 text-lg">🌡️ ${weatherData.main.temp}°C</p>
    <p class="text-gray-600 capitalize">☁️ ${weatherData.weather[0].description}</p>
    <p class="text-gray-600">💧 Humidity: ${weatherData.main.humidity}%</p>
    <p class="text-gray-600">💨 Wind Speed: ${weatherData.wind.speed} m/s</p>
  </div>
</div>
```

---

## 5. Adding the Component to the Application

Include the **Weather Dashboard** component in your **main app**:

```html
<!-- src/my-app.html -->
<weather-dashboard></weather-dashboard>
```

---

## 6. Running the Application

Start the development server:

```bash
npm start
```

The browser will open automatically to the Aurelia app.

---

## 7. Additional Enhancements

- **Dark Mode Support**: Configure Tailwind to support dark mode and apply corresponding styles.
- **Responsive Design**: Utilize Tailwind’s responsive utilities for mobile-friendly UI.
- **Custom Themes**: Extend Tailwind’s theme in tailwind.config.js for custom branding.
- **Hourly Forecast**: Fetch and display hourly or weekly weather forecasts.

---

## Conclusion

This guide demonstrated how to **integrate Tailwind CSS with Aurelia 2 using Vite**, enabling a responsive, modern, and styled weather dashboard. With **real-time weather data** from OpenWeatherMap, this project highlights Aurelia’s data-binding and service integration capabilities.

For more details on **Tailwind CSS**, refer to the [official documentation](https://tailwindcss.com/docs).
