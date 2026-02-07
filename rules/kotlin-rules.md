# Kotlin Linting Rules for Moa Calendar

## Severity Levels
- **ERROR**: Must fix before commit
- **WARNING**: Should fix, may pass CI
- **INFO**: Best practice suggestion

## Rules

### Immutability (ERROR)

```kotlin
// ERROR: Mutable collection in public API
fun getUsers(): MutableList<User>  // BAD
fun getUsers(): List<User>         // GOOD

// ERROR: var for non-mutating property
var userId: Long  // BAD if never reassigned
val userId: Long  // GOOD
```

### Null Safety (ERROR)

```kotlin
// ERROR: !! operator in production code
val name = user!!.name  // FORBIDDEN

// ALLOWED: !! in test code only
@Test
fun test() {
    val result = service.find()!!  // OK in tests
}
```

### Naming (WARNING)

```kotlin
// WARNING: Hungarian notation
val strName: String     // BAD
val name: String        // GOOD

// WARNING: Abbreviations
val usr: User           // BAD
val user: User          // GOOD

// WARNING: Boolean naming
val flag: Boolean       // BAD
val isActive: Boolean   // GOOD
val hasPermission: Boolean  // GOOD
```

### Functions (WARNING)

```kotlin
// WARNING: Function too long (>30 lines)
// Split into smaller functions

// WARNING: Too many parameters (>5)
fun create(a, b, c, d, e, f): T  // BAD
fun create(request: CreateRequest): T  // GOOD

// WARNING: Side effects in expression functions
fun save() = repository.save(entity).also { log.info("Saved") }  // BAD
fun save(): Entity {
    val saved = repository.save(entity)
    log.info("Saved: ${saved.id}")
    return saved
}  // GOOD
```

### Collections (INFO)

```kotlin
// INFO: Prefer sequence for large collections with multiple operations
users.filter { }.map { }.take(10)  // Creates intermediate lists
users.asSequence().filter { }.map { }.take(10).toList()  // Lazy evaluation
```

### Coroutines (INFO)

```kotlin
// INFO: Use structured concurrency
GlobalScope.launch { }  // BAD
coroutineScope { launch { } }  // GOOD

// INFO: Prefer suspend over blocking
fun blockingCall(): T  // BAD in async context
suspend fun asyncCall(): T  // GOOD
```

## File Organization

```kotlin
// Order within a class:
// 1. Companion object
// 2. Properties (val before var)
// 3. Init blocks
// 4. Secondary constructors
// 5. Methods (public before private)
// 6. Nested classes

class Example(
    val id: Long,
    val name: String
) {
    companion object {
        const val MAX_SIZE = 100
    }

    val computed: String
        get() = name.uppercase()

    var mutableField: Int = 0

    init {
        require(name.isNotBlank())
    }

    fun publicMethod() { }

    private fun privateMethod() { }

    data class Nested(val value: String)
}
```

## Suppression

Only suppress with justification:

```kotlin
@Suppress("TooManyFunctions")  // Justification: Controller requires many endpoints
class LargeController { }
```
