# SKILLS.md - Technical Implementation Guide

## Full Stack Application: Kotlin/Spring Boot + React Native/TypeScript

This document provides reusable technical patterns and implementation guides for building full-stack applications with this tech stack.

---

## 📚 Table of Contents

1. [Tech Stack Details](#tech-stack-details)
2. [Authentication System](#authentication-system)
3. [API Integration Patterns](#api-integration-patterns)
4. [State Management](#state-management)
5. [Data Flow Patterns](#data-flow-patterns)
6. [Common Implementations](#common-implementations)

---

## 🛠️ Tech Stack Details

### Backend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Language | Kotlin | 1.9+ | Type-safe backend development |
| Framework | Spring Boot | 4.0 | REST API framework |
| Database | MySQL | 8.0 | Relational database |
| Cache | Redis | Latest | Session storage, caching |
| ORM | Spring Data JPA | - | Database abstraction |
| Query Builder | QueryDSL | - | Type-safe queries |
| Build Tool | Gradle | - | Kotlin DSL configuration |
| Auth | Spring Security | - | JWT + OAuth2 |
| Testing | JUnit 5 + MockK | - | Unit & integration testing |

**Build Configuration Example**:
```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "1.9.0"
    kotlin("plugin.spring")
    kotlin("plugin.jpa")
    id("org.springframework.boot") version "4.0.0"
}

dependencies {
    // Spring Boot
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security")

    // Database
    implementation("mysql:mysql-connector-java")
    implementation("org.springframework.boot:spring-boot-starter-data-redis")

    // QueryDSL (optional)
    implementation("com.querydsl:querydsl-jpa:5.0.0:jakarta")
    kapt("com.querydsl:querydsl-apt:5.0.0:jakarta")
}
```

### Frontend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Language | TypeScript | 5.0+ | Type-safe JavaScript |
| Framework | React Native | 0.74+ | Cross-platform mobile |
| State (Server) | TanStack Query | v5 | Server state management |
| State (Client) | Zustand | 4.5+ | Client state management |
| Navigation | React Navigation | 6.x | Navigation system |
| HTTP Client | Axios | 1.6+ | API requests |
| Forms | react-hook-form + zod | - | Form handling |
| Dates | date-fns | 3.6+ | Date manipulation |

**Package Configuration Example**:
```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.74.0",
    "@react-navigation/native": "^6.1.17",
    "@tanstack/react-query": "^5.28.0",
    "zustand": "^4.5.2",
    "axios": "^1.6.8",
    "date-fns": "^3.6.0",
    "react-hook-form": "^7.51.3",
    "zod": "^3.23.6"
  }
}
```

---

## 🔐 Authentication System

### JWT with Refresh Token Rotation (RTR)

**Authentication Flow Diagram**:

```
User                Frontend            Backend             Storage
  │                     │                   │                   │
  │  1. Login          │                   │                   │
  ├──────────────────>│                   │                   │
  │                     │ 2. POST /auth/login                 │
  │                     ├─────────────────>│                   │
  │                     │                   │ 3. Validate      │
  │                     │                   │                   │
  │                     │ 4. Return tokens  │                   │
  │                     │<─────────────────┤                   │
  │                     │ 5. Store tokens                       │
  │                     ├──────────────────────────────────────>│
  │                     │                   │                   │
  │  6. API Request     │                   │                   │
  │                     ├─────────────────>│                   │
  │                     │ (Bearer token)    │                   │
  │                     │                   │                   │
  │                     │ 7. If expired     │                   │
  │                     │<─────────────────┤                   │
  │                     │ (401)            │                   │
  │                     │                   │                   │
  │                     │ 8. Refresh token  │                   │
  │                     ├─────────────────>│                   │
  │                     │                   │                   │
  │                     │ 9. New tokens     │                   │
  │                     │<─────────────────┤                   │
  │                     │ 10. Update storage                    │
  │                     ├──────────────────────────────────────>│
```

### Backend Implementation

**Security Configuration**:
```kotlin
@Configuration
@EnableWebSecurity
class SecurityConfig {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .sessionManagement {
                it.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }
            .authorizeHttpRequests {
                it.requestMatchers("/api/v1/auth/**").permitAll()
                  .anyRequest().authenticated()
            }
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter::class.java
            )

        return http.build()
    }
}
```

**JWT Authentication Filter**:
```kotlin
class JwtAuthenticationFilter(
    private val jwtTokenProvider: JwtTokenProvider
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val token = extractToken(request)

        if (token != null && jwtTokenProvider.validateToken(token)) {
            val authentication = jwtTokenProvider.getAuthentication(token)
            SecurityContextHolder.getContext().authentication = authentication
        }

        filterChain.doFilter(request, response)
    }

    private fun extractToken(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader("Authorization")
        return if (bearerToken?.startsWith("Bearer ") == true) {
            bearerToken.substring(7)
        } else null
    }
}
```

### Frontend Implementation

**Axios Interceptor with Automatic Token Refresh**:
```typescript
// src/api/client.ts
import axios from 'axios';
import { authStore } from '../store/authStore';

const apiClient = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = authStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = authStore.getState().refreshToken;
        const response = await axios.post('/auth/refresh', {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens
        authStore.getState().setTokens(accessToken, newRefreshToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        authStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

**Auth Store with Secure Storage**:
```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;

  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) => {
        SecureStore.setItemAsync('accessToken', accessToken);
        SecureStore.setItemAsync('refreshToken', refreshToken);
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        SecureStore.deleteItemAsync('accessToken');
        SecureStore.deleteItemAsync('refreshToken');
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false
        });
      },
    }),
    { name: 'auth-storage' }
  )
);
```

---

## 🌐 API Integration Patterns

### Backend API Endpoint Structure

```kotlin
// Controller
@RestController
@RequestMapping("/api/v1/items")
class ItemController(
    private val itemService: ItemService
) {
    @GetMapping("/{id}")
    fun getItem(@PathVariable id: Long): ResponseEntity<ItemResponse> {
        val item = itemService.findById(id)
        return ResponseEntity.ok(ItemResponse.from(item))
    }

    @PostMapping
    fun createItem(@Valid @RequestBody request: CreateItemRequest): ResponseEntity<ItemResponse> {
        val item = itemService.create(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(ItemResponse.from(item))
    }
}

// DTO
data class CreateItemRequest(
    @field:NotBlank
    val name: String,

    @field:Min(0)
    val quantity: Int
)

data class ItemResponse(
    val id: Long,
    val name: String,
    val quantity: Int,
    val createdAt: LocalDateTime
) {
    companion object {
        fun from(item: Item) = ItemResponse(
            id = item.id!!,
            name = item.name,
            quantity = item.quantity,
            createdAt = item.createdAt
        )
    }
}
```

### Frontend API Client

**Endpoint Functions**:
```typescript
// src/api/endpoints/items.ts
import apiClient from '../client';

export interface Item {
  id: number;
  name: string;
  quantity: number;
  createdAt: string;
}

export interface CreateItemRequest {
  name: string;
  quantity: number;
}

export const itemsApi = {
  getById: async (id: number): Promise<Item> => {
    const response = await apiClient.get(`/items/${id}`);
    return response.data;
  },

  getAll: async (): Promise<Item[]> => {
    const response = await apiClient.get('/items');
    return response.data;
  },

  create: async (data: CreateItemRequest): Promise<Item> => {
    const response = await apiClient.post('/items', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateItemRequest>): Promise<Item> => {
    const response = await apiClient.put(`/items/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/items/${id}`);
  },
};
```

### React Query Integration

**Query Hook**:
```typescript
// src/hooks/queries/useItems.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { itemsApi, Item } from '../../api/endpoints/items';

export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (filters: string) => [...itemKeys.lists(), { filters }] as const,
  details: () => [...itemKeys.all, 'detail'] as const,
  detail: (id: number) => [...itemKeys.details(), id] as const,
};

export const useItem = (id: number): UseQueryResult<Item, Error> => {
  return useQuery({
    queryKey: itemKeys.detail(id),
    queryFn: () => itemsApi.getById(id),
    enabled: !!id,
  });
};

export const useItems = (): UseQueryResult<Item[], Error> => {
  return useQuery({
    queryKey: itemKeys.lists(),
    queryFn: () => itemsApi.getAll(),
  });
};
```

**Mutation Hook**:
```typescript
// src/hooks/mutations/useItemMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi, CreateItemRequest } from '../../api/endpoints/items';
import { itemKeys } from '../queries/useItems';

export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateItemRequest) => itemsApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: itemKeys.lists()
      });
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => itemsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: itemKeys.all
      });
    },
  });
};
```

---

## 🏛️ State Management

### Two-Tier Strategy

**1. Server State** (React Query):
- All data from backend APIs
- Automatic caching
- Background refetching
- Optimistic updates

**2. Client State** (Zustand):
- Auth tokens, user session
- Theme preferences
- UI state (modals, selections)

**Important Rule**: NEVER store server data in Zustand!

### Example: Theme Store

```typescript
// src/store/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',

      toggleTheme: () =>
        set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),

      setTheme: (mode) => set({ mode }),
    }),
    { name: 'theme-storage' }
  )
);
```

---

## 🔄 Data Flow Patterns

### Complete Flow Example: Creating an Item

```
1. User Action
   └─> User fills form and clicks "Save"

2. Form Submission
   └─> useCreateItem mutation triggered

3. API Call
   └─> POST /api/v1/items
       Headers: { Authorization: "Bearer <token>" }
       Body: { name, quantity }

4. Backend Processing
   └─> JWT Filter validates token
   └─> Controller receives request
   └─> Service creates item
   └─> Repository saves to database
   └─> Return created item DTO

5. Response Handling
   └─> React Query receives response
   └─> onSuccess callback triggers
   └─> queryClient.invalidateQueries(['items'])
   └─> All item queries refetch

6. UI Update
   └─> Component re-renders with new data
   └─> List shows new item
   └─> Success message displayed
```

### Safety Pattern for Undefined Data

**Problem**: React Query with `enabled` condition returns `undefined` when disabled.

**Solution**: Always add safety checks!

```typescript
// ❌ WRONG - Will crash if data is undefined
const items = useMemo(() => {
  return itemsData.map(item => ({
    id: item.id,
    label: item.name,
  }));
}, [itemsData]);

// ✅ CORRECT - Safe with undefined check
const items = useMemo(() => {
  if (!itemsData || !Array.isArray(itemsData)) {
    return [];
  }
  return itemsData.map(item => ({
    id: item.id,
    label: item.name,
  }));
}, [itemsData]);
```

---

## 🎨 Common Implementations

### Modal Pattern

**Bottom Sheet Modal with Tabs**:
```typescript
const InputModal = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
        />
        <View style={styles.bottomSheet}>
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  activeTab === tab.key && styles.activeTab
                ]}
                onPress={() => setActiveTab(tab.key)}>
                <Text>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.content}>
            {activeTab === 'tab1' && <Tab1Content />}
            {activeTab === 'tab2' && <Tab2Content />}
          </View>
        </View>
      </View>
    </Modal>
  );
};
```

### Pagination Pattern

**Backend**:
```kotlin
@GetMapping
fun getItems(
    @RequestParam(defaultValue = "0") page: Int,
    @RequestParam(defaultValue = "20") size: Int
): Page<ItemResponse> {
    val pageable = PageRequest.of(page, size)
    return itemService.findAll(pageable)
        .map { ItemResponse.from(it) }
}
```

**Frontend**:
```typescript
export const useItemsInfinite = () => {
  return useInfiniteQuery({
    queryKey: itemKeys.lists(),
    queryFn: ({ pageParam = 0 }) => itemsApi.getPage(pageParam),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasNext ? pages.length : undefined,
  });
};
```

### Form with Validation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  quantity: z.number().min(0, 'Quantity must be positive'),
});

type FormData = z.infer<typeof schema>;

const ItemForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createMutation = useCreateItem();

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <input type="number" {...register('quantity', { valueAsNumber: true })} />
      {errors.quantity && <span>{errors.quantity.message}</span>}

      <button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
};
```

---

## 🚨 Critical Patterns to Remember

1. **Always add safety checks for React Query data**
2. **Never store server state in Zustand**
3. **Use query invalidation after mutations**
4. **Handle JWT refresh in interceptors**
5. **Use TypeScript strict mode - no `any` types**
6. **Follow Conventional Commits**
7. **Add Co-Authored-By for AI commits**

---

**Last Updated**: 2026-02-01
**Maintained By**: Development Team + AI Assistant
