# Global Loading State System

This app includes a comprehensive global loading state system to provide consistent loading feedback across all pages and user interactions.

## Components

### 1. Loading Store (`useLoadingStore`)
A Zustand store that manages the global loading state.

```typescript
interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  setLoading: (loading: boolean, message?: string) => void;
  clearLoading: () => void;
}
```

### 2. GlobalLoading Component
A full-screen overlay that shows a spinner and optional message when loading is active.

### 3. Navigation Hook (`useNavigationLoading`)
A custom hook that provides navigation functions with automatic loading states.

```typescript
const { navigateWithLoading, replaceWithLoading, backWithLoading } = useNavigationLoading();
```

### 4. Utility Functions (`loadingUtils`)
Helper functions for common loading scenarios.

## Usage Examples

### Basic Usage with Store
```typescript
import { useLoadingStore } from '@/app/store';

const { setLoading, clearLoading } = useLoadingStore();

// Show loading
setLoading(true, 'Processing...');

// Hide loading
clearLoading();
```

### Navigation with Loading
```typescript
import { useNavigationLoading } from '@/app/hooks/useNavigationLoading';

const { navigateWithLoading } = useNavigationLoading();

// Navigate with loading
navigateWithLoading('/products', 'Loading products...');
```

### Utility Functions
```typescript
import { showGlobalLoading, hideGlobalLoading, LOADING_MESSAGES, withLoading } from '@/app/utils/loadingUtils';

// Show loading manually
showGlobalLoading(LOADING_MESSAGES.SAVING);

// Hide loading manually
hideGlobalLoading();

// Wrap async function with loading
await withLoading(async () => {
  // Your async operation
  await saveData();
}, 'Saving data...');
```

### Form Submissions
```typescript
const handleSubmit = async (data: FormData) => {
  try {
    showGlobalLoading(LOADING_MESSAGES.FORM_SUBMISSION);
    await submitForm(data);
    toast.success('Form submitted successfully!');
  } catch (error) {
    toast.error('Failed to submit form');
  } finally {
    hideGlobalLoading();
  }
};
```

### API Operations
```typescript
const handleAddToCart = async (productId: string) => {
  try {
    showGlobalLoading(LOADING_MESSAGES.ADDING_TO_CART);
    await addToCart(productId, 1);
    toast.success('Added to cart!');
  } catch (error) {
    toast.error('Failed to add to cart');
  } finally {
    hideGlobalLoading();
  }
};
```

## Predefined Loading Messages

The system includes predefined loading messages for common scenarios:

- `NAVIGATION`: 'Loading page...'
- `SEARCH`: 'Searching...'
- `LOGIN`: 'Signing you in...'
- `LOGOUT`: 'Signing you out...'
- `SAVING`: 'Saving changes...'
- `LOADING_PRODUCTS`: 'Loading products...'
- `ADDING_TO_CART`: 'Adding to cart...'
- `CHECKOUT`: 'Processing checkout...'
- `LANGUAGE_CHANGE`: 'Changing language...'
- `FORM_SUBMISSION`: 'Submitting form...'
- `IMAGE_UPLOAD`: 'Uploading image...'
- `DATA_SYNC`: 'Syncing data...'

## Auto-Loading Features

### Route Changes
The system automatically clears loading states when navigation completes through the `RouteLoadingProvider`.

### Component Mounting
Use the `withComponentLoading` HOC for components that need loading on mount:

```typescript
export default withComponentLoading(MyComponent, 'Loading component...');
```

## Best Practices

1. **Always use try/finally**: Ensure loading is cleared even if operations fail
2. **Provide meaningful messages**: Use descriptive loading messages for better UX
3. **Don't nest loading states**: Avoid showing multiple loading indicators
4. **Keep it consistent**: Use predefined messages when available
5. **Handle errors gracefully**: Show error toasts when operations fail

## Styling

The loading overlay is styled with:
- Semi-transparent backdrop with blur effect
- Centered spinner and message
- Smooth fade-in animation
- Mobile-responsive design
- Dark mode support

## Integration Points

The loading system is integrated into:
- ✅ Navigation (Navbar links, language changes, search)
- ✅ Product operations (Add to cart, wishlist)
- ✅ Form submissions
- ✅ Route transitions
- ✅ API calls

## Customization

To customize the loading appearance:
1. Edit `GlobalLoading.module.css` for styling
2. Modify `GlobalLoading.tsx` for different spinner types
3. Add new messages to `LOADING_MESSAGES` in `loadingUtils.ts`

## Performance

The loading system is optimized for performance:
- Uses Zustand for minimal re-renders
- Lightweight components
- CSS animations for smooth transitions
- Automatic cleanup on unmount
