# Data Table with Sorting, Filtering & Pagination

A complete, production-ready data table with sorting, filtering, pagination, row selection, and responsive design.

## Features Demonstrated

- **Two-way data binding** - Search input, filters, page size
- **Computed properties** - Filtered, sorted, and paginated data
- **`repeat.for` with keys** - Efficient list rendering with tracking
- **Event handling** - Sort, filter, pagination clicks
- **Conditional rendering** - Empty states, loading states
- **Value converters** - Date and number formatting
- **CSS class binding** - Active sort, selected rows
- **Debouncing** - Optimize search performance

## Code

### View Model (data-table.ts)

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: Date;
  tasksCompleted: number;
}

type SortColumn = 'name' | 'email' | 'role' | 'status' | 'lastLogin' | 'tasksCompleted';
type SortDirection = 'asc' | 'desc';

export class DataTable {
  // Raw data (would normally come from API)
  private allUsers: User[] = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'Admin',
      status: 'active',
      lastLogin: new Date('2025-01-08'),
      tasksCompleted: 127
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'User',
      status: 'active',
      lastLogin: new Date('2025-01-09'),
      tasksCompleted: 89
    },
    {
      id: 3,
      name: 'Carol Williams',
      email: 'carol@example.com',
      role: 'Manager',
      status: 'inactive',
      lastLogin: new Date('2024-12-15'),
      tasksCompleted: 203
    },
    {
      id: 4,
      name: 'David Brown',
      email: 'david@example.com',
      role: 'User',
      status: 'pending',
      lastLogin: new Date('2025-01-07'),
      tasksCompleted: 45
    },
    {
      id: 5,
      name: 'Eve Davis',
      email: 'eve@example.com',
      role: 'User',
      status: 'active',
      lastLogin: new Date('2025-01-09'),
      tasksCompleted: 156
    },
    // Add more sample data...
    {
      id: 6,
      name: 'Frank Miller',
      email: 'frank@example.com',
      role: 'Admin',
      status: 'active',
      lastLogin: new Date('2025-01-08'),
      tasksCompleted: 312
    },
    {
      id: 7,
      name: 'Grace Wilson',
      email: 'grace@example.com',
      role: 'Manager',
      status: 'active',
      lastLogin: new Date('2025-01-09'),
      tasksCompleted: 178
    },
    {
      id: 8,
      name: 'Henry Moore',
      email: 'henry@example.com',
      role: 'User',
      status: 'inactive',
      lastLogin: new Date('2024-11-20'),
      tasksCompleted: 67
    },
    {
      id: 9,
      name: 'Iris Taylor',
      email: 'iris@example.com',
      role: 'User',
      status: 'active',
      lastLogin: new Date('2025-01-09'),
      tasksCompleted: 234
    },
    {
      id: 10,
      name: 'Jack Anderson',
      email: 'jack@example.com',
      role: 'Manager',
      status: 'active',
      lastLogin: new Date('2025-01-08'),
      tasksCompleted: 189
    }
  ];

  // Filter state
  searchQuery = '';
  selectedRole: string = 'all';
  selectedStatus: string = 'all';

  // Sort state
  sortColumn: SortColumn = 'name';
  sortDirection: SortDirection = 'asc';

  // Pagination state
  currentPage = 1;
  pageSize = 5;

  // Selection state
  selectedRows = new Set<number>();

  // Loading state
  isLoading = false;

  // Computed: Filtered data
  get filteredUsers(): User[] {
    return this.allUsers.filter(user => {
      // Search filter
      const query = this.searchQuery.toLowerCase();
      const matchesSearch = !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);

      // Role filter
      const matchesRole = this.selectedRole === 'all' ||
        user.role === this.selectedRole;

      // Status filter
      const matchesStatus = this.selectedStatus === 'all' ||
        user.status === this.selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  // Computed: Sorted data
  get sortedUsers(): User[] {
    const sorted = [...this.filteredUsers];

    sorted.sort((a, b) => {
      let aVal: any = a[this.sortColumn];
      let bVal: any = b[this.sortColumn];

      // Handle dates
      if (aVal instanceof Date) {
        aVal = aVal.getTime();
        bVal = (bVal as Date).getTime();
      }

      // Handle strings (case-insensitive)
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  // Computed: Paginated data
  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.sortedUsers.slice(start, end);
  }

  // Computed: Pagination info
  get totalPages(): number {
    return Math.ceil(this.sortedUsers.length / this.pageSize);
  }

  get totalResults(): number {
    return this.sortedUsers.length;
  }

  get startResult(): number {
    if (this.totalResults === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endResult(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalResults);
  }

  pageSizeChanged(newValue: number | string) {
    const numeric = typeof newValue === 'string' ? Number(newValue) : newValue;
    if (typeof numeric === 'number' && !Number.isNaN(numeric) && numeric !== this.pageSize) {
      this.pageSize = numeric;
      return;
    }
    this.currentPage = 1;
  }

  get pages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    // Adjust start if we're near the end
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Computed: Selection state
  get allPageSelected(): boolean {
    if (this.paginatedUsers.length === 0) return false;
    return this.paginatedUsers.every(user => this.selectedRows.has(user.id));
  }

  get somePageSelected(): boolean {
    if (this.paginatedUsers.length === 0) return false;
    return this.paginatedUsers.some(user => this.selectedRows.has(user.id)) &&
      !this.allPageSelected;
  }

  // Actions
  sort(column: SortColumn) {
    if (this.sortColumn === column) {
      // Toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  toggleAllPageSelection() {
    if (this.allPageSelected) {
      // Deselect all on page
      this.paginatedUsers.forEach(user => this.selectedRows.delete(user.id));
    } else {
      // Select all on page
      this.paginatedUsers.forEach(user => this.selectedRows.add(user.id));
    }
  }

  clearSelection() {
    this.selectedRows.clear();
  }

  deleteSelected() {
    if (this.selectedRows.size === 0) return;

    const confirmed = confirm(`Delete ${this.selectedRows.size} user(s)?`);
    if (!confirmed) return;

    // Remove selected users
    this.allUsers = this.allUsers.filter(user => !this.selectedRows.has(user.id));

    // Clear selection
    this.selectedRows.clear();

    // Adjust page if needed
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  // Reset filters
  resetFilters() {
    this.searchQuery = '';
    this.selectedRole = 'all';
    this.selectedStatus = 'all';
    this.currentPage = 1;
  }

  // Watch for filter changes and reset to page 1
  searchQueryChanged() {
    this.currentPage = 1;
  }

  selectedRoleChanged() {
    this.currentPage = 1;
  }

  selectedStatusChanged() {
    this.currentPage = 1;
  }
}
```

### Template (data-table.html)

```html
<div class="data-table">
  <!-- Header with filters -->
  <div class="table-header">
      <h2>Users</h2>

      <div class="table-actions">
        <button
          type="button"
          click.trigger="deleteSelected()"
          disabled.bind="selectedRows.size === 0"
          class="btn btn-danger">
          Delete Selected (${selectedRows.size})
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="table-filters">
      <div class="filter-group">
        <label for="search">Search</label>
        <input
          type="text"
          id="search"
          value.bind="searchQuery & debounce:300"
          placeholder="Search by name or email...">
      </div>

      <div class="filter-group">
        <label for="role">Role</label>
        <select id="role" value.bind="selectedRole">
          <option value="all">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="User">User</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="status">Status</label>
        <select id="status" value.bind="selectedStatus">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="pageSize">Per Page</label>
        <select id="pageSize" value.bind="pageSize">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
      </div>

      <button
        type="button"
        click.trigger="resetFilters()"
        class="btn btn-secondary">
        Reset Filters
      </button>
    </div>

    <!-- Results summary -->
    <div class="table-summary">
      Showing ${startResult}-${endResult} of ${totalResults} users
      <span if.bind="selectedRows.size > 0">
        (${selectedRows.size} selected)
      </span>
    </div>

    <!-- Data Table -->
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th class="col-checkbox">
              <input
                type="checkbox"
                checked.bind="allPageSelected"
                indeterminate.bind="somePageSelected"
                change.trigger="toggleAllPageSelection()"
                aria-label="Select all on page">
            </th>
            <th
              click.trigger="sort('name')"
              class="sortable ${sortColumn === 'name' ? 'sorted' : ''}">
              Name
              <span class="sort-icon" if.bind="sortColumn === 'name'">
                ${sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            </th>
            <th
              click.trigger="sort('email')"
              class="sortable ${sortColumn === 'email' ? 'sorted' : ''}">
              Email
              <span class="sort-icon" if.bind="sortColumn === 'email'">
                ${sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            </th>
            <th
              click.trigger="sort('role')"
              class="sortable ${sortColumn === 'role' ? 'sorted' : ''}">
              Role
              <span class="sort-icon" if.bind="sortColumn === 'role'">
                ${sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            </th>
            <th
              click.trigger="sort('status')"
              class="sortable ${sortColumn === 'status' ? 'sorted' : ''}">
              Status
              <span class="sort-icon" if.bind="sortColumn === 'status'">
                ${sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            </th>
            <th
              click.trigger="sort('lastLogin')"
              class="sortable ${sortColumn === 'lastLogin' ? 'sorted' : ''}">
              Last Login
              <span class="sort-icon" if.bind="sortColumn === 'lastLogin'">
                ${sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            </th>
            <th
              click.trigger="sort('tasksCompleted')"
              class="sortable ${sortColumn === 'tasksCompleted' ? 'sorted' : ''} col-number">
              Tasks
              <span class="sort-icon" if.bind="sortColumn === 'tasksCompleted'">
                ${sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            repeat.for="user of paginatedUsers"
            class="${selectedRows.has(user.id) ? 'selected' : ''}">
            <td class="col-checkbox">
              <input
                type="checkbox"
                model.bind="user.id"
                checked.bind="selectedRows"
                aria-label="Select ${user.name}">
            </td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
              <span class="badge badge-${user.role.toLowerCase()}">
                ${user.role}
              </span>
            </td>
            <td>
              <span class="status-${user.status}">
                ${user.status}
              </span>
            </td>
            <td>${user.lastLogin | dateFormat:'MMM d, yyyy'}</td>
            <td class="col-number">${user.tasksCompleted}</td>
          </tr>
        </tbody>
      </table>

      <!-- Empty state -->
      <div if.bind="paginatedUsers.length === 0" class="empty-state">
        <p>No users found</p>
        <button
          type="button"
          click.trigger="resetFilters()"
          class="btn btn-primary">
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div if.bind="totalPages > 1" class="table-pagination">
      <button
        type="button"
        click.trigger="previousPage()"
        disabled.bind="currentPage === 1"
        class="btn btn-secondary"
        aria-label="Previous page">
        ← Previous
      </button>

      <div class="pagination-pages">
        <button
          if.bind="pages[0] > 1"
          type="button"
          click.trigger="goToPage(1)"
          class="btn btn-page">
          1
        </button>
        <span if.bind="pages[0] > 2" class="pagination-ellipsis">...</span>

        <button
          repeat.for="page of pages"
          type="button"
          click.trigger="goToPage(page)"
          class="btn btn-page ${page === currentPage ? 'active' : ''}"
          aria-label="Page ${page}"
          aria-current="${page === currentPage ? 'page' : undefined}">
          ${page}
        </button>

        <span if.bind="pages[pages.length - 1] < totalPages - 1" class="pagination-ellipsis">...</span>
        <button
          if.bind="pages[pages.length - 1] < totalPages"
          type="button"
          click.trigger="goToPage(totalPages)"
          class="btn btn-page">
          ${totalPages}
        </button>
      </div>

      <button
        type="button"
        click.trigger="nextPage()"
        disabled.bind="currentPage === totalPages"
        class="btn btn-secondary"
        aria-label="Next page">
        Next →
      </button>
    </div>
  </div>
```

### Styles (data-table.css)

```css
.data-table {
  width: 100%;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
}

.table-summary {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background-color: #f5f5f5;
}

.table th,
.table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.table th.sortable {
  cursor: pointer;
  user-select: none;
}

.table th.sortable:hover {
  background-color: #e8e8e8;
}

.table th.sorted {
  background-color: #e3f2fd;
}

.sort-icon {
  margin-left: 0.25rem;
  font-size: 0.75rem;
}

.col-checkbox {
  width: 40px;
  text-align: center;
}

.col-number {
  text-align: right;
}

.table tbody tr:hover {
  background-color: #f9f9f9;
}

.table tbody tr.selected {
  background-color: #e3f2fd;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-admin {
  background-color: #ff5722;
  color: white;
}

.badge-manager {
  background-color: #2196f3;
  color: white;
}

.badge-user {
  background-color: #4caf50;
  color: white;
}

.status-active {
  color: #4caf50;
}

.status-inactive {
  color: #999;
}

.status-pending {
  color: #ff9800;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

.btn-page {
  min-width: 40px;
  padding: 0.5rem;
}

.btn-page.active {
  background-color: #2196f3;
  color: white;
}

.pagination-ellipsis {
  padding: 0.5rem;
  color: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .table-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .table-pagination {
    flex-direction: column;
  }

  .table {
    font-size: 0.875rem;
  }

  .table th,
  .table td {
    padding: 0.5rem;
  }
}
```

## How It Works

### Filtering Pipeline

Data flows through a pipeline:
1. **Raw data** (`allUsers`) → all records
2. **Filtered** (`filteredUsers`) → apply search and dropdown filters
3. **Sorted** (`sortedUsers`) → apply column sorting
4. **Paginated** (`paginatedUsers`) → slice for current page

Each computed property builds on the previous one, keeping the logic clean and testable.

### Sorting

Click column headers to sort. The first click sorts ascending, the second descending, and subsequent clicks toggle between the two. The active sort column is highlighted.

### Pagination

Smart pagination shows up to 5 page numbers with ellipsis for gaps. Always shows first and last pages. Automatically adjusts when filters reduce total pages.

### Selection

- Checkbox in header selects/deselects all rows on current page
- Individual row checkboxes for granular selection
- Selected rows track across pages
- Delete selected button removes all selected users

### Performance

- **Debounced search** (300ms) prevents excessive filtering
- **Keyed repeat** ensures efficient DOM updates
- **Computed properties** cache results until dependencies change

## Variations

### Server-Side Pagination

For large datasets, move filtering/sorting to the server:

```typescript
async loadUsers() {
  this.isLoading = true;

  const params = new URLSearchParams({
    page: this.currentPage.toString(),
    pageSize: this.pageSize.toString(),
    search: this.searchQuery,
    role: this.selectedRole,
    status: this.selectedStatus,
    sortColumn: this.sortColumn,
    sortDirection: this.sortDirection
  });

  try {
    const response = await fetch(`/api/users?${params}`);
    const data = await response.json();

    this.allUsers = data.users;
    this.totalResults = data.total; // Server provides total count
  } finally {
    this.isLoading = false;
  }
}
```

### Inline Editing

Add edit mode for quick updates:

```typescript
editingRow: number | null = null;

startEdit(userId: number) {
  this.editingRow = userId;
}

async saveEdit(user: User) {
  await fetch(`/api/users/${user.id}`, {
    method: 'PUT',
    body: JSON.stringify(user)
  });

  this.editingRow = null;
}

cancelEdit() {
  this.editingRow = null;
  // Restore original data
}
```

### Column Visibility Toggle

Let users show/hide columns:

```typescript
visibleColumns = {
  name: true,
  email: true,
  role: true,
  status: true,
  lastLogin: true,
  tasksCompleted: true
};
```

```html
<th if.bind="visibleColumns.email">Email</th>
```

## Related

- [Product Catalog](./product-catalog.md) - Another filtering/sorting example
- [List Rendering](../repeats-and-list-rendering.md) - `repeat.for` documentation
- [Conditional Rendering](../conditional-rendering.md) - `if.bind` and `show.bind`
- [Value Converters](../value-converters.md) - Date/number formatting
