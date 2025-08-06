---
description: Learn how to integrate third-party JavaScript libraries with Aurelia 2 using proper lifecycle management, DOM interaction patterns, and ref usage.
---

# Third Party Library Integration

Integrating third-party JavaScript libraries with Aurelia 2 requires understanding Aurelia's component lifecycle, DOM interaction patterns, and proper cleanup strategies. This guide covers best practices for seamless integration.

## Understanding Aurelia's Lifecycle

Aurelia provides several lifecycle hooks that are crucial for third-party library integration:

```typescript
export class MyComponent {
  // 1. Constructor - DI injection, basic setup
  constructor() {}
  
  // 2. created() - Component fully constructed, children resolved
  public created(): void {}
  
  // 3. binding() - Bindable properties assigned, before view binding
  public binding(): void {}
  
  // 4. bound() - View bindings established, refs available
  public bound(): void {}
  
  // 5. attached() - Component attached to DOM, ideal for 3rd party libs
  public attached(): void {}
  
  // 6. detaching() - Before DOM removal, cleanup time
  public detaching(): void {}
  
  // 7. unbinding() - Before view unbinding
  public unbinding(): void {}
}
```

## DOM Interaction Patterns

### Using Template References

Template references (`ref`) provide direct access to DOM elements:

```typescript
import { customElement } from 'aurelia';

@customElement({
  name: 'chart-component',
  template: `
    <template>
      <div ref="chartContainer" class="chart-container"></div>
    </template>
  `
})
export class ChartComponent {
  private chartContainer!: HTMLDivElement;
  private chartInstance: any;

  public attached(): void {
    // chartContainer is now available and attached to DOM
    this.initializeChart();
  }

  private initializeChart(): void {
    // Third-party library initialization
    this.chartInstance = new SomeChartLibrary(this.chartContainer, {
      // configuration options
    });
  }

  public detaching(): void {
    // Always cleanup
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }
}
```

### Working with Multiple Refs

```typescript
@customElement({
  name: 'complex-widget',
  template: `
    <template>
      <div ref="headerElement" class="widget-header"></div>
      <div ref="contentElement" class="widget-content"></div>
      <div ref="footerElement" class="widget-footer"></div>
    </template>
  `
})
export class ComplexWidget {
  private headerElement!: HTMLDivElement;
  private contentElement!: HTMLDivElement;
  private footerElement!: HTMLDivElement;
  private widgetInstance: any;

  public attached(): void {
    // All refs are guaranteed to be available
    this.widgetInstance = new ComplexLibrary({
      header: this.headerElement,
      content: this.contentElement,
      footer: this.footerElement,
      onHeaderClick: this.handleHeaderClick.bind(this),
      onContentChange: this.handleContentChange.bind(this)
    });
  }

  private handleHeaderClick(): void {
    console.log('Header clicked');
  }

  private handleContentChange(data: any): void {
    console.log('Content changed:', data);
  }

  public detaching(): void {
    this.widgetInstance?.destroy();
  }
}
```

## Common Integration Patterns

### 1. Chart Libraries (D3.js, Chart.js, etc.)

```typescript
import { customElement, bindable } from 'aurelia';
import * as d3 from 'd3';

export interface ChartData {
  label: string;
  value: number;
}

@customElement({
  name: 'd3-bar-chart',
  template: `
    <template>
      <svg ref="svgElement" class="d3-chart"></svg>
    </template>
  `
})
export class D3BarChart {
  @bindable public data: ChartData[] = [];
  @bindable public width: number = 400;
  @bindable public height: number = 300;

  private svgElement!: SVGElement;
  private svg: d3.Selection<SVGElement, unknown, null, undefined>;

  public attached(): void {
    this.svg = d3.select(this.svgElement);
    this.renderChart();
  }

  public propertyChanged(name: string): void {
    if (['data', 'width', 'height'].includes(name) && this.svg) {
      this.renderChart();
    }
  }

  private renderChart(): void {
    // Clear previous chart
    this.svg.selectAll('*').remove();

    if (!this.data || this.data.length === 0) return;

    // Set dimensions
    this.svg
      .attr('width', this.width)
      .attr('height', this.height);

    // Create scales
    const xScale = d3.scaleBand()
      .domain(this.data.map(d => d.label))
      .range([0, this.width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d.value) || 0])
      .range([this.height, 0]);

    // Draw bars
    this.svg.selectAll('.bar')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.label) || 0)
      .attr('y', d => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', d => this.height - yScale(d.value))
      .attr('fill', 'steelblue');
  }
}
```

### 2. Date Pickers and Input Widgets

```typescript
import { customElement, bindable } from 'aurelia';
import flatpickr from 'flatpickr';
import type { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';

@customElement({
  name: 'date-picker',
  template: `
    <template>
      <input 
        ref="inputElement" 
        type="text" 
        class="date-input"
        placeholder="Select date..." />
    </template>
  `
})
export class DatePicker {
  @bindable public value: Date | null = null;
  @bindable public format: string = 'Y-m-d';
  @bindable public minDate?: Date;
  @bindable public maxDate?: Date;
  @bindable public onChange?: (date: Date | null) => void;

  private inputElement!: HTMLInputElement;
  private flatpickrInstance: FlatpickrInstance | null = null;

  public attached(): void {
    this.flatpickrInstance = flatpickr(this.inputElement, {
      dateFormat: this.format,
      minDate: this.minDate,
      maxDate: this.maxDate,
      defaultDate: this.value,
      onChange: (selectedDates) => {
        const newValue = selectedDates.length > 0 ? selectedDates[0] : null;
        this.value = newValue;
        this.onChange?.(newValue);
      }
    });
  }

  public propertyChanged(name: string): void {
    if (!this.flatpickrInstance) return;

    switch (name) {
      case 'value':
        this.flatpickrInstance.setDate(this.value || '');
        break;
      case 'minDate':
        this.flatpickrInstance.set('minDate', this.minDate);
        break;
      case 'maxDate':
        this.flatpickrInstance.set('maxDate', this.maxDate);
        break;
    }
  }

  public detaching(): void {
    if (this.flatpickrInstance) {
      this.flatpickrInstance.destroy();
      this.flatpickrInstance = null;
    }
  }
}
```

### 3. Rich Text Editors

```typescript
import { customElement, bindable } from 'aurelia';
import Quill from 'quill';

@customElement({
  name: 'rich-text-editor',
  template: `
    <template>
      <div ref="editorContainer" class="editor-container"></div>
    </template>
  `
})
export class RichTextEditor {
  @bindable public content: string = '';
  @bindable public placeholder: string = 'Start typing...';
  @bindable public readOnly: boolean = false;
  @bindable public onContentChange?: (content: string) => void;

  private editorContainer!: HTMLDivElement;
  private quillInstance: Quill | null = null;
  private isUpdatingFromProperty = false;

  public attached(): void {
    this.quillInstance = new Quill(this.editorContainer, {
      theme: 'snow',
      placeholder: this.placeholder,
      readOnly: this.readOnly,
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          ['link', 'blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['clean']
        ]
      }
    });

    // Set initial content
    if (this.content) {
      this.quillInstance.clipboard.dangerouslyPasteHTML(this.content);
    }

    // Listen for content changes
    this.quillInstance.on('text-change', () => {
      if (!this.isUpdatingFromProperty) {
        const html = this.quillInstance!.root.innerHTML;
        this.content = html;
        this.onContentChange?.(html);
      }
    });
  }

  public propertyChanged(name: string): void {
    if (!this.quillInstance) return;

    switch (name) {
      case 'content':
        if (!this.isUpdatingFromProperty) {
          this.isUpdatingFromProperty = true;
          this.quillInstance.clipboard.dangerouslyPasteHTML(this.content);
          this.isUpdatingFromProperty = false;
        }
        break;
      case 'readOnly':
        this.quillInstance.enable(!this.readOnly);
        break;
    }
  }

  public detaching(): void {
    if (this.quillInstance) {
      this.quillInstance.off('text-change');
      // Quill doesn't have a destroy method, but we can clean up
      this.editorContainer.innerHTML = '';
      this.quillInstance = null;
    }
  }
}
```

### 4. Modal and Overlay Libraries

```typescript
import { customElement, bindable } from 'aurelia';
import { Modal } from 'bootstrap';

@customElement({
  name: 'bootstrap-modal',
  template: `
    <template>
      <div 
        ref="modalElement" 
        class="modal fade" 
        tabindex="-1"
        data-bs-backdrop.bind="backdrop"
        data-bs-keyboard.bind="keyboard">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header" if.bind="title">
              <h5 class="modal-title">\${title}</h5>
              <button 
                type="button" 
                class="btn-close" 
                data-bs-dismiss="modal"
                aria-label="Close">
              </button>
            </div>
            <div class="modal-body">
              <slot></slot>
            </div>
            <div class="modal-footer" if.bind="showFooter">
              <button 
                type="button" 
                class="btn btn-secondary" 
                data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  `
})
export class BootstrapModal {
  @bindable public isOpen: boolean = false;
  @bindable public title?: string;
  @bindable public backdrop: boolean | 'static' = true;
  @bindable public keyboard: boolean = true;
  @bindable public showFooter: boolean = true;
  @bindable public onShow?: () => void;
  @bindable public onHide?: () => void;

  private modalElement!: HTMLDivElement;
  private modalInstance: Modal | null = null;

  public attached(): void {
    this.modalInstance = new Modal(this.modalElement, {
      backdrop: this.backdrop,
      keyboard: this.keyboard
    });

    // Listen to Bootstrap modal events
    this.modalElement.addEventListener('shown.bs.modal', () => {
      this.isOpen = true;
      this.onShow?.();
    });

    this.modalElement.addEventListener('hidden.bs.modal', () => {
      this.isOpen = false;
      this.onHide?.();
    });

    // Show modal if initially open
    if (this.isOpen) {
      this.modalInstance.show();
    }
  }

  public propertyChanged(name: string): void {
    if (name === 'isOpen' && this.modalInstance) {
      if (this.isOpen) {
        this.modalInstance.show();
      } else {
        this.modalInstance.hide();
      }
    }
  }

  public detaching(): void {
    if (this.modalInstance) {
      this.modalInstance.dispose();
      this.modalInstance = null;
    }
  }
}
```

## Advanced Integration Techniques

### Custom Attributes for Third-Party Libraries

```typescript
import { autoinject, customAttribute } from 'aurelia';

@customAttribute('tooltip')
export class TooltipAttribute {
  private element: Element;
  private tooltipInstance: any;

  constructor(element: Element) {
    this.element = element;
  }

  public attached(): void {
    // Initialize tooltip library
    this.tooltipInstance = new Tooltip(this.element, {
      title: this.value,
      placement: 'top',
      trigger: 'hover'
    });
  }

  public valueChanged(newValue: string): void {
    if (this.tooltipInstance) {
      this.tooltipInstance.setContent(newValue);
    }
  }

  public detaching(): void {
    if (this.tooltipInstance) {
      this.tooltipInstance.destroy();
      this.tooltipInstance = null;
    }
  }
}
```

Usage:
```html
<button tooltip="Click me for action">Action Button</button>
```

### Handling Async Library Loading

```typescript
@customElement({
  name: 'lazy-map',
  template: `
    <template>
      <div if.bind="loading" class="loading">Loading map...</div>
      <div if.bind="error" class="error">Failed to load map: \${error}</div>
      <div if.bind="!loading && !error" ref="mapContainer" class="map-container"></div>
    </template>
  `
})
export class LazyMap {
  @bindable public apiKey: string = '';
  @bindable public center: { lat: number; lng: number } = { lat: 0, lng: 0 };

  private mapContainer!: HTMLDivElement;
  private mapInstance: any;
  private loading = true;
  private error: string | null = null;

  public async attached(): Promise<void> {
    try {
      // Dynamically load Google Maps
      await this.loadGoogleMapsAPI();
      this.initializeMap();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      this.loading = false;
    }
  }

  private async loadGoogleMapsAPI(): Promise<void> {
    // Check if already loaded
    if (window.google?.maps) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      (window as any).initGoogleMaps = () => {
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    });
  }

  private initializeMap(): void {
    this.mapInstance = new google.maps.Map(this.mapContainer, {
      center: this.center,
      zoom: 10
    });
  }

  public propertyChanged(name: string): void {
    if (name === 'center' && this.mapInstance) {
      this.mapInstance.setCenter(this.center);
    }
  }

  public detaching(): void {
    // Google Maps doesn't need explicit cleanup
    // But remove global callback if needed
    delete (window as any).initGoogleMaps;
  }
}
```

## Error Handling and Resilience

### Library Loading with Fallbacks

```typescript
@customElement({
  name: 'resilient-chart',
  template: `
    <template>
      <div if.bind="usingFallback" class="fallback-chart">
        <h4>\${data.title}</h4>
        <ul>
          <li repeat.for="item of data.items">
            \${item.label}: \${item.value}
          </li>
        </ul>
      </div>
      <div if.bind="!usingFallback" ref="chartContainer"></div>
    </template>
  `
})
export class ResilientChart {
  @bindable public data: any = {};
  
  private chartContainer!: HTMLDivElement;
  private chartInstance: any;
  private usingFallback = false;

  public async attached(): Promise<void> {
    try {
      // Try to load preferred library
      const ChartLibrary = await import('preferred-chart-library');
      this.chartInstance = new ChartLibrary.Chart(this.chartContainer, {
        data: this.data
      });
    } catch (primaryError) {
      console.warn('Primary chart library failed, trying fallback:', primaryError);
      
      try {
        // Try fallback library
        const FallbackLibrary = await import('fallback-chart-library');
        this.chartInstance = new FallbackLibrary.SimpleChart(this.chartContainer, {
          data: this.data
        });
      } catch (fallbackError) {
        console.error('Both chart libraries failed:', fallbackError);
        // Use HTML fallback
        this.usingFallback = true;
      }
    }
  }

  public detaching(): void {
    if (this.chartInstance && !this.usingFallback) {
      this.chartInstance.destroy?.();
    }
  }
}
```

## Performance Optimization

### Intersection Observer for Lazy Loading

```typescript
@customElement({
  name: 'lazy-third-party',
  template: `
    <template>
      <div class="placeholder" ref="placeholder" if.bind="!loaded">
        <div class="loading-indicator">Component will load when visible...</div>
      </div>
      <div ref="componentContainer" if.bind="loaded"></div>
    </template>
  `
})
export class LazyThirdParty {
  @bindable public threshold: number = 0.1;
  
  private placeholder!: HTMLDivElement;
  private componentContainer!: HTMLDivElement;
  private loaded = false;
  private observer: IntersectionObserver | null = null;
  private thirdPartyInstance: any;

  public attached(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.loadComponent();
        }
      },
      { threshold: this.threshold }
    );

    this.observer.observe(this.placeholder);
  }

  private async loadComponent(): Promise<void> {
    if (this.loaded) return;

    try {
      this.loaded = true;
      this.observer?.disconnect();

      // Wait for DOM update
      await new Promise(resolve => setTimeout(resolve, 0));

      // Initialize third-party component
      const ThirdPartyLib = await import('heavy-third-party-library');
      this.thirdPartyInstance = new ThirdPartyLib.Component(
        this.componentContainer,
        {
          // configuration
        }
      );
    } catch (error) {
      console.error('Failed to load third-party component:', error);
      this.loaded = false;
    }
  }

  public detaching(): void {
    this.observer?.disconnect();
    this.thirdPartyInstance?.destroy();
  }
}
```

## Best Practices Summary

### 1. Lifecycle Management
- **Initialize** third-party libraries in `attached()` when DOM is ready
- **Clean up** in `detaching()` to prevent memory leaks
- Use `propertyChanged()` for reactive updates

### 2. DOM Access
- Always use `ref` for direct DOM element access
- Ensure elements are available before library initialization
- Avoid direct DOM queries when possible

### 3. Error Handling
- Wrap library initialization in try-catch blocks
- Provide fallbacks for critical functionality
- Log errors for debugging

### 4. Performance
- Use Intersection Observer for lazy loading
- Consider async loading for non-critical libraries
- Clean up event listeners and observers

### 5. Memory Management
- Always call destroy/cleanup methods
- Remove event listeners
- Clear references to prevent memory leaks

This comprehensive approach ensures robust third-party library integration while maintaining Aurelia's reactive capabilities and performance characteristics.