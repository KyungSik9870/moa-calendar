## Kotlin Coding Style & Performance Rules

### 1. Core Principles
* **Immutability First**: Prefer `val` over `var`. Use immutable collections. Leverage `.copy()` for state transitions.
* **Null Safety**: **NEVER** use `!!` (double bang). Use `?.`, `?:`, `let`, `requireNotNull()`, or `checkNotNull()`.
* **Expression-Oriented**: Everything is an expression. Use `if`, `when`, and `try` as values, not statements.
* **Type Safety**: Leverage sealed classes, enums, and inline value classes for domain modeling.
* **Simplicity**: Avoid over-engineering. Prefer composition over inheritance. Keep hierarchies flat.
* **Readability**: Code is read 10x more than written. Optimize for clarity, not cleverness.

---

### 2. Idiomatic Kotlin Patterns

#### 2.1 Sealed Classes for Type-Safe State
Use sealed classes to represent closed type hierarchies with exhaustive `when` checks.

```kotlin
// ✅ BEST: Type-safe result with compiler-enforced exhaustiveness
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Throwable, val message: String? = null) : Result<Nothing>()
    data object Loading : Result<Nothing>()
}

fun handleResult(result: Result<User>) = when (result) {
    is Result.Success -> displayUser(result.data)
    is Result.Error -> showError(result.message ?: result.exception.message)
    is Result.Loading -> showProgress()
    // No 'else' needed - compiler ensures all cases are covered
}
```

#### 2.2 Extension Functions for Clean APIs
Extend existing types instead of creating utility classes.

```kotlin
// ❌ BAD: Utility class with static methods
object StringUtils {
    fun isValidEmail(str: String): Boolean =
        str.contains("@") && str.contains(".")
}

// ✅ BEST: Extension function
fun String.isValidEmail(): Boolean =
    contains("@") && contains(".")

// Usage
if (email.isValidEmail()) { ... }
```

#### 2.3 Scope Functions: Use the Right Tool
| Function | Object Reference | Return Value | Use Case |
|----------|------------------|--------------|----------|
| `let` | `it` | Lambda result | Null safety, transformations |
| `run` | `this` | Lambda result | Object configuration + computation |
| `apply` | `this` | Context object | Object initialization |
| `also` | `it` | Context object | Side effects (logging, validation) |
| `with` | `this` | Lambda result | Grouping calls on same object |

```kotlin
// ✅ BEST: let for null safety and transformation
val length = email?.let {
    validate(it)
    it.length
}

// ✅ BEST: apply for object initialization
val user = User().apply {
    name = "Alice"
    email = "alice@example.com"
}

// ✅ BEST: also for side effects
val result = computeExpensiveValue()
    .also { logger.debug("Computed: $it") }
    .also { cache.store(it) }
```

#### 2.4 Data Classes for Value Objects
Use data classes for DTOs, entities, and value objects.

```kotlin
// ✅ BEST: Data class with validation in init
data class Email(val value: String) {
    init {
        require(value.contains("@")) { "Invalid email format" }
    }
}

// Immutable update
val updatedUser = user.copy(email = Email("new@example.com"))
```

#### 2.5 Inline Value Classes for Type Safety
Use `@JvmInline value class` to wrap primitives without runtime overhead.

```kotlin
// ✅ BEST: Zero-cost type safety
@JvmInline
value class UserId(val value: Long)

@JvmInline
value class GroupId(val value: Long)

// Now you can't accidentally mix them
fun findUser(userId: UserId): User
fun findGroup(groupId: GroupId): Group
```

---

### 3. Efficiency Checklist
- [ ] **Avoid Chain Waste**: Use `asSequence()` for large collections (>100 items) with multiple operations.
- [ ] **Flat Logic**: Use `when` expressions or **Early Returns** instead of nested `if-else`.
- [ ] **Inline Policy**: Use `inline` ONLY for functions accepting lambdas (e.g., higher-order functions).
- [ ] **Named & Default Arguments**: Eliminate function overloading with default parameters.
- [ ] **Smart Casts**: Let the compiler auto-cast after `is` checks. Never use `as` after `is`.

---

### 4. Advanced Patterns

#### 4.1 Companion Objects vs Top-Level Functions
```kotlin
// ❌ AVOID: Companion object for simple factories
class User {
    companion object {
        fun create(name: String) = User(name)
    }
}

// ✅ BETTER: Top-level factory function (unless you need polymorphism)
fun createUser(name: String) = User(name)

// ✅ BEST: Use companion object only for constants or when extending interfaces
class User {
    companion object {
        const val MAX_NAME_LENGTH = 50
    }
}
```

#### 4.2 Collection Builders & DSLs
```kotlin
// ✅ BEST: Use buildList, buildMap for concise initialization
val numbers = buildList {
    add(1)
    addAll(listOf(2, 3))
    if (condition) add(4)
}

// ✅ BEST: Type-safe builders for domain models
fun schedule(block: ScheduleBuilder.() -> Unit) =
    ScheduleBuilder().apply(block).build()

// Usage
val mySchedule = schedule {
    title = "Team Meeting"
    date = LocalDate.now()
    addParticipant("Alice")
}
```

#### 4.3 Destructuring & Component Functions
```kotlin
// ✅ BEST: Destructure data classes
val (name, email) = user

// ✅ BEST: Destructure in loops
for ((key, value) in map) {
    println("$key -> $value")
}

// ✅ BEST: Ignore unused components with underscore
val (_, email, _) = user
```

#### 4.4 Type Aliases for Readability
```kotlin
// ✅ BEST: Clarify complex types
typealias UserId = Long
typealias Callback = (Result<User>) -> Unit
typealias TransactionMap = Map<LocalDate, List<Transaction>>

fun fetchUser(id: UserId, callback: Callback)
```

#### 4.5 Delegation Pattern
```kotlin
// ✅ BEST: Use 'by' for property delegation
class LazyUser {
    val expensiveData: String by lazy {
        // Computed only once, on first access
        fetchFromDatabase()
    }

    var name: String by Delegates.observable("") { _, old, new ->
        logger.info("Name changed: $old -> $new")
    }
}

// ✅ BEST: Interface delegation
class Repository(
    private val cache: Cache
) : Cache by cache {
    // Override only what you need
    override fun get(key: String): String? =
        cache.get(key) ?: fetchFromDb(key)
}
```

---

### 5. Performance Optimization

#### 5.1 Sequence vs Collection
```kotlin
// ❌ BAD: Eager evaluation creates intermediate lists
val result = users
    .filter { it.active }        // Creates list
    .map { it.email }            // Creates another list
    .filter { it.endsWith(".com") } // Creates third list
    .take(10)

// ✅ BEST: Lazy evaluation with sequence
val result = users.asSequence()
    .filter { it.active }
    .map { it.email }
    .filter { it.endsWith(".com") }
    .take(10)
    .toList()  // Terminal operation
```

#### 5.2 Early Returns & Guard Clauses
```kotlin
// ❌ BAD: Nested conditions
fun processOrder(order: Order?) {
    if (order != null) {
        if (order.items.isNotEmpty()) {
            if (order.status == Status.PENDING) {
                // Process
            }
        }
    }
}

// ✅ BEST: Guard clauses with early returns
fun processOrder(order: Order?) {
    require(order != null) { "Order cannot be null" }
    if (order.items.isEmpty()) return
    if (order.status != Status.PENDING) return

    // Process with flat logic
}
```

#### 5.3 Inline Functions for Lambdas
```kotlin
// ✅ BEST: inline for higher-order functions (avoids lambda object allocation)
inline fun <T> measureTime(block: () -> T): Pair<T, Long> {
    val start = System.currentTimeMillis()
    val result = block()
    val duration = System.currentTimeMillis() - start
    return result to duration
}

// ❌ AVOID: inline for regular functions (increases bytecode size)
inline fun simpleAdd(a: Int, b: Int) = a + b  // Don't do this
```

---

### 6. Coroutines & Asynchronous Code

#### 6.1 Structured Concurrency
```kotlin
// ✅ BEST: Use coroutineScope for structured concurrency
suspend fun loadUserData(userId: UserId): UserData = coroutineScope {
    val profile = async { fetchProfile(userId) }
    val settings = async { fetchSettings(userId) }
    val transactions = async { fetchTransactions(userId) }

    UserData(
        profile = profile.await(),
        settings = settings.await(),
        transactions = transactions.await()
    )
}

// ❌ AVOID: GlobalScope (leaks memory, unstructured)
GlobalScope.launch { ... }  // Never use this
```

#### 6.2 Flow for Reactive Streams
```kotlin
// ✅ BEST: Use Flow for reactive data streams
fun observeTransactions(groupId: GroupId): Flow<List<Transaction>> = flow {
    while (true) {
        val transactions = repository.getTransactions(groupId)
        emit(transactions)
        delay(5000)  // Poll every 5 seconds
    }
}

// ✅ BEST: Transform flows with operators
fun getActiveUsers(): Flow<User> =
    userRepository.observeUsers()
        .filter { it.isActive }
        .map { it.toDto() }
        .catch { e -> logger.error("Error fetching users", e) }
```

#### 6.3 Exception Handling in Coroutines
```kotlin
// ✅ BEST: Use runCatching for suspending functions
suspend fun fetchUser(id: UserId): Result<User> =
    runCatching {
        apiClient.getUser(id)
    }.onFailure {
        logger.error("Failed to fetch user $id", it)
    }

// ✅ BEST: Use supervisorScope when child failures shouldn't cancel siblings
suspend fun loadDashboard() = supervisorScope {
    val user = async { fetchUser() }
    val transactions = async { fetchTransactions() }

    // If fetchUser fails, fetchTransactions continues
    Dashboard(user.await(), transactions.await())
}
```

---

### 7. Error Handling & Safety

#### 7.1 Result Pattern over Exceptions
```kotlin
// ✅ BEST: Sealed class for domain errors
sealed class UserError {
    data class NotFound(val userId: UserId) : UserError()
    data class InvalidEmail(val email: String) : UserError()
    data object Unauthorized : UserError()
}

fun findUser(id: UserId): Result<User, UserError> {
    // Business logic
}

// ✅ BEST: Use kotlin.Result for simple cases
fun parseAmount(input: String): Result<BigDecimal> =
    runCatching { BigDecimal(input) }
```

#### 7.2 Contract Validation
```kotlin
// ✅ BEST: Use require() for preconditions (throws IllegalArgumentException)
fun createTransaction(amount: BigDecimal, category: String) {
    require(amount > BigDecimal.ZERO) { "Amount must be positive" }
    require(category.isNotBlank()) { "Category cannot be blank" }
}

// ✅ BEST: Use check() for state validation (throws IllegalStateException)
fun complete() {
    check(status == Status.PENDING) { "Transaction already completed" }
    status = Status.COMPLETED
}

// ✅ BEST: Use requireNotNull() / checkNotNull() for null checks
fun process(order: Order?) {
    val validOrder = requireNotNull(order) { "Order cannot be null" }
    // validOrder is smart-cast to Order (non-null)
}
```

#### 7.3 Safe Null Handling
```kotlin
// ❌ NEVER: Don't use !!
val user = findUser(id)!!  // FORBIDDEN

// ✅ BEST: Use safe call with elvis operator
val name = findUser(id)?.name ?: "Unknown"

// ✅ BEST: Use let for null-safe transformations
findUser(id)?.let { user ->
    logger.info("Found user: ${user.name}")
    processUser(user)
}

// ✅ BEST: Use requireNotNull when null is truly unexpected
val user = requireNotNull(findUser(id)) { "User $id must exist" }
```

---

### 8. Naming Conventions

- **Classes**: PascalCase (`UserService`, `TransactionRepository`)
- **Functions**: camelCase (`findUser`, `calculateTotal`)
- **Properties**: camelCase (`firstName`, `isActive`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- **Type Parameters**: Single uppercase letter or PascalCase (`T`, `K`, `V`, `ResponseType`)
- **Packages**: lowercase, no underscores (`com.modum.calendar.domain`)

```kotlin
// ✅ BEST: Clear, descriptive names
class TransactionService {
    companion object {
        const val MAX_TRANSACTION_AMOUNT = 1_000_000
    }

    fun calculateMonthlyExpense(groupId: GroupId): BigDecimal

    private val isInitialized: Boolean = false
}
```

---

### 9. Quick Reference

| Pattern | Use | Avoid |
|---------|-----|-------|
| `val` | Always preferred | `var` unless necessary |
| `?.` or `?:` | Null handling | `!!` (forbidden) |
| `when` | Control flow | Nested `if-else` |
| `sealed class` | Type hierarchies | Open inheritance |
| `data class` | Value objects | Mutable classes |
| `inline` | Lambda parameters | Regular functions |
| `require()` | Argument validation | Manual checks |
| `check()` | State validation | Manual assertions |
| Extension functions | Utility methods | Utility classes |
| `asSequence()` | Large collections | Always using lists |
| `runCatching` | Error handling | `try-catch` everywhere |