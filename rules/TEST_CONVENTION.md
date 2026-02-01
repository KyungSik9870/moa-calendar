## Test Code Convention

### 1. Core Principles
- **Test Stack**: JUnit 5 + **Kotest** (for matchers) + **MockK** (Kotlin-friendly mocking)
- **Structure**: Strictly follow **Given-When-Then** pattern with clear separation
- **Naming**: Use backtick syntax for readable test names describing **behavior**, not implementation
- **Independence**: Tests must be isolated, repeatable, and order-independent
- **Coverage**: Test happy paths, edge cases, boundary values, and error scenarios
- **Readability**: Tests are living documentation - optimize for clarity

---

### 2. Test Naming Convention

Use **backticks** to write test names as natural language sentences.

```kotlin
// ✅ BEST: Describes behavior and expectation
@Test
fun `should return user when valid ID is provided`()

@Test
fun `should throw NotFound exception when user does not exist`()

@Test
fun `should calculate total expense excluding cancelled transactions`()

// ❌ BAD: Technical implementation focus
@Test
fun testGetUser()

@Test
fun findUserByIdTest()
```

**Pattern**: `should [expected behavior] when [condition]`

---

### 3. Given-When-Then Structure

Always use explicit comments to separate test phases.

```kotlin
@Test
fun `should create transaction linked to schedule`() {
    // given: Set up test data and mocks
    val schedule = Schedule(id = 1L, title = "Team Lunch")
    val amount = BigDecimal("50000")

    // when: Execute the behavior being tested
    val transaction = Transaction.create(
        amount = amount,
        category = Category.FOOD,
        schedule = schedule
    )

    // then: Assert the expected outcome
    transaction.amount shouldBe amount
    transaction.schedule shouldBe schedule
    transaction.category shouldBe Category.FOOD
}
```

---

### 4. Testing with Kotest Matchers

Kotest provides expressive, Kotlin-idiomatic assertions.

```kotlin
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.collections.*
import io.kotest.matchers.string.shouldContain

@Test
fun `should filter active users correctly`() {
    // given
    val users = listOf(
        User(name = "Alice", isActive = true),
        User(name = "Bob", isActive = false),
        User(name = "Charlie", isActive = true)
    )

    // when
    val activeUsers = users.filter { it.isActive }

    // then
    activeUsers shouldHaveSize 2
    activeUsers.map { it.name } shouldContainExactly listOf("Alice", "Charlie")
    activeUsers.all { it.isActive } shouldBe true
}
```

---

### 5. Mocking with MockK

MockK is designed specifically for Kotlin with coroutine support.

#### 5.1 Basic Mocking
```kotlin
@Test
fun `should fetch user from repository`() {
    // given
    val mockRepository = mockk<UserRepository>()
    val expectedUser = User(id = 1L, name = "Alice")

    every { mockRepository.findById(1L) } returns expectedUser

    val service = UserService(mockRepository)

    // when
    val result = service.getUser(1L)

    // then
    result shouldBe expectedUser
    verify(exactly = 1) { mockRepository.findById(1L) }
}
```

#### 5.2 Verifying Interactions
```kotlin
@Test
fun `should send email notification after transaction created`() {
    // given
    val mockEmailService = mockk<EmailService>(relaxed = true)
    val transactionService = TransactionService(mockEmailService)

    // when
    transactionService.createTransaction(
        amount = BigDecimal("100"),
        type = TransactionType.EXPENSE
    )

    // then
    verify {
        mockEmailService.sendNotification(
            match { it.contains("Transaction created") }
        )
    }
}
```

#### 5.3 Slot Capturing for Complex Verification
```kotlin
@Test
fun `should save transaction with correct timestamp`() {
    // given
    val mockRepository = mockk<TransactionRepository>()
    val slot = slot<Transaction>()

    every { mockRepository.save(capture(slot)) } returns mockk()

    val service = TransactionService(mockRepository)

    // when
    service.createTransaction(amount = BigDecimal("500"))

    // then
    val savedTransaction = slot.captured
    savedTransaction.amount shouldBe BigDecimal("500")
    savedTransaction.createdAt shouldNotBe null
    savedTransaction.createdAt shouldBeAfter LocalDateTime.now().minusMinutes(1)
}
```

---

### 6. Exception & Error Testing

#### 6.1 Testing Expected Exceptions
```kotlin
@Test
fun `should throw exception when transaction amount is negative`() {
    // given
    val amount = BigDecimal("-100")

    // when & then
    shouldThrow<IllegalArgumentException> {
        Transaction.create(amount = amount)
    }.message shouldContain "Amount must be positive"
}
```

#### 6.2 Testing Result Types
```kotlin
@Test
fun `should return error when user not found`() {
    // given
    val mockRepository = mockk<UserRepository>()
    every { mockRepository.findById(999L) } returns null

    val service = UserService(mockRepository)

    // when
    val result = service.getUser(999L)

    // then
    result.isFailure shouldBe true
    result.exceptionOrNull() shouldBeInstanceOf UserNotFoundException::class
}
```

---

### 7. Parameterized Tests

Test multiple scenarios with `@ParameterizedTest`.

```kotlin
@ParameterizedTest
@CsvSource(
    "100, PERSONAL, true",
    "0, PERSONAL, false",
    "-50, JOINT, false",
    "1000000, JOINT, true"
)
fun `should validate transaction amount for different types`(
    amount: Long,
    type: TransactionType,
    expectedValid: Boolean
) {
    // given
    val transaction = Transaction(
        amount = BigDecimal(amount),
        type = type
    )

    // when
    val isValid = transaction.isValid()

    // then
    isValid shouldBe expectedValid
}
```

#### Using MethodSource for Complex Data
```kotlin
@ParameterizedTest
@MethodSource("transactionTestCases")
fun `should calculate budget correctly for various scenarios`(testCase: BudgetTestCase) {
    // given
    val budget = Budget(total = testCase.totalBudget)

    // when
    val remaining = budget.calculateRemaining(testCase.expenses)

    // then
    remaining shouldBe testCase.expectedRemaining
}

companion object {
    @JvmStatic
    fun transactionTestCases() = listOf(
        BudgetTestCase(
            totalBudget = BigDecimal("100000"),
            expenses = listOf(BigDecimal("30000"), BigDecimal("20000")),
            expectedRemaining = BigDecimal("50000")
        ),
        BudgetTestCase(
            totalBudget = BigDecimal("50000"),
            expenses = emptyList(),
            expectedRemaining = BigDecimal("50000")
        )
    )
}

data class BudgetTestCase(
    val totalBudget: BigDecimal,
    val expenses: List<BigDecimal>,
    val expectedRemaining: BigDecimal
)
```

---

### 8. Coroutine & Async Testing

#### 8.1 Testing Suspend Functions
```kotlin
@Test
fun `should fetch user asynchronously`() = runTest {
    // given
    val mockRepository = mockk<UserRepository>()
    coEvery { mockRepository.fetchUser(1L) } returns User(id = 1L, name = "Alice")

    val service = UserService(mockRepository)

    // when
    val result = service.getUserAsync(1L)

    // then
    result shouldBe User(id = 1L, name = "Alice")
    coVerify(exactly = 1) { mockRepository.fetchUser(1L) }
}
```

#### 8.2 Testing Flow
```kotlin
@Test
fun `should emit all transactions as flow`() = runTest {
    // given
    val transactions = listOf(
        Transaction(amount = BigDecimal("100")),
        Transaction(amount = BigDecimal("200"))
    )
    val mockRepository = mockk<TransactionRepository>()
    every { mockRepository.observeTransactions() } returns flowOf(*transactions.toTypedArray())

    val service = TransactionService(mockRepository)

    // when
    val result = service.observeTransactions().toList()

    // then
    result shouldHaveSize 2
    result shouldContainExactly transactions
}
```

#### 8.3 Testing Delays & Timeouts
```kotlin
@Test
fun `should timeout when operation takes too long`() = runTest {
    // given
    val slowService = mockk<ExternalService>()
    coEvery { slowService.fetchData() } coAnswers {
        delay(10000)  // 10 seconds
        "data"
    }

    // when & then
    shouldThrow<TimeoutCancellationException> {
        withTimeout(1000) {  // 1 second timeout
            slowService.fetchData()
        }
    }
}
```

---

### 9. Integration Tests (Spring Boot)

#### 9.1 Repository Tests
```kotlin
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class TransactionRepositoryTest {

    @Autowired
    private lateinit var transactionRepository: TransactionRepository

    @Autowired
    private lateinit var entityManager: TestEntityManager

    @Test
    fun `should find transactions by group and date range`() {
        // given
        val group = entityManager.persist(Group(name = "Family"))
        val transaction1 = Transaction(
            groupId = group.id,
            date = LocalDate.of(2024, 1, 15),
            amount = BigDecimal("100")
        )
        val transaction2 = Transaction(
            groupId = group.id,
            date = LocalDate.of(2024, 1, 20),
            amount = BigDecimal("200")
        )
        entityManager.persist(transaction1)
        entityManager.persist(transaction2)
        entityManager.flush()

        // when
        val result = transactionRepository.findByGroupIdAndDateBetween(
            groupId = group.id,
            startDate = LocalDate.of(2024, 1, 1),
            endDate = LocalDate.of(2024, 1, 31)
        )

        // then
        result shouldHaveSize 2
        result.map { it.amount } shouldContainExactlyInAnyOrder listOf(
            BigDecimal("100"),
            BigDecimal("200")
        )
    }
}
```

#### 9.2 REST API Tests
```kotlin
@SpringBootTest
@AutoConfigureMockMvc
class ScheduleControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockkBean
    private lateinit var scheduleService: ScheduleService

    @Test
    fun `should create schedule via POST endpoint`() {
        // given
        val request = CreateScheduleRequest(
            title = "Team Meeting",
            date = LocalDate.now(),
            groupId = 1L
        )
        val expected = Schedule(id = 1L, title = "Team Meeting")

        every { scheduleService.create(any()) } returns expected

        // when & then
        mockMvc.perform(
            post("/api/v1/schedules")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.title").value("Team Meeting"))

        verify(exactly = 1) { scheduleService.create(any()) }
    }

    @Test
    fun `should return 404 when schedule not found`() {
        // given
        every { scheduleService.findById(999L) } throws ScheduleNotFoundException(999L)

        // when & then
        mockMvc.perform(get("/api/v1/schedules/999"))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.error").value("Schedule not found"))
    }
}
```

---

### 10. Test Fixtures & Builders

Create reusable test data builders for cleaner tests.

```kotlin
// ✅ BEST: Object Mother pattern for test data
object UserFixtures {
    fun createUser(
        id: Long = 1L,
        name: String = "Test User",
        email: String = "test@example.com",
        isActive: Boolean = true
    ) = User(
        id = id,
        name = name,
        email = email,
        isActive = isActive
    )

    fun createInactiveUser() = createUser(isActive = false)
    fun createAdmin() = createUser(name = "Admin", email = "admin@example.com")
}

// ✅ BEST: Builder pattern for complex objects
class TransactionBuilder {
    private var amount: BigDecimal = BigDecimal.ZERO
    private var type: TransactionType = TransactionType.EXPENSE
    private var category: Category = Category.OTHER
    private var schedule: Schedule? = null

    fun withAmount(value: BigDecimal) = apply { this.amount = value }
    fun withType(value: TransactionType) = apply { this.type = value }
    fun linkedToSchedule(value: Schedule) = apply { this.schedule = value }

    fun build() = Transaction(
        amount = amount,
        type = type,
        category = category,
        schedule = schedule
    )
}

// Usage in tests
@Test
fun `should calculate total with builder`() {
    // given
    val transaction = TransactionBuilder()
        .withAmount(BigDecimal("500"))
        .withType(TransactionType.EXPENSE)
        .linkedToSchedule(Schedule(title = "Lunch"))
        .build()

    // when & then
    transaction.amount shouldBe BigDecimal("500")
}
```

---

### 11. Best Practices Checklist

- [ ] **Test names** describe **behavior**, not implementation
- [ ] **Given-When-Then** structure with clear comments
- [ ] **One assertion concept** per test (not one assertion, but one concept)
- [ ] **Test independence** - no shared mutable state
- [ ] **Fast execution** - mock external dependencies
- [ ] **Edge cases** covered (null, empty, zero, negative, max values)
- [ ] **Error scenarios** tested with expected exceptions
- [ ] **Verify interactions** when side effects matter
- [ ] **Use fixtures** to reduce duplication
- [ ] **Readable assertions** with Kotest matchers

---

### 12. Anti-Patterns to Avoid

```kotlin
// ❌ BAD: Testing implementation details
@Test
fun `should call repository save method`() {
    verify { repository.save(any()) }  // Too coupled to implementation
}

// ✅ GOOD: Testing behavior
@Test
fun `should persist user when registration succeeds`() {
    val user = service.register("alice@example.com")
    user.id shouldNotBe null  // Focus on outcome
}

// ❌ BAD: Multiple unrelated assertions in one test
@Test
fun `should do everything`() {
    // Tests user creation, deletion, and update
}

// ✅ GOOD: Separate tests for separate behaviors
@Test
fun `should create user with valid email`()

@Test
fun `should update user name`()

@Test
fun `should delete inactive user`()

// ❌ BAD: Shared mutable state
class BadTest {
    val sharedList = mutableListOf<User>()  // Shared across tests!

    @Test
    fun test1() { sharedList.add(...) }

    @Test
    fun test2() { sharedList.size shouldBe 1 }  // Flaky!
}

// ✅ GOOD: Isolated state
class GoodTest {
    @Test
    fun test1() {
        val list = mutableListOf<User>()  // Local to test
        list.add(...)
    }
}
```

---

### 13. Quick Reference

| Category | Recommended | Avoid |
|----------|-------------|-------|
| **Naming** | Backtick behavior descriptions | `testMethodName()` |
| **Structure** | Given-When-Then | Unstructured code |
| **Assertions** | Kotest matchers | JUnit assertions |
| **Mocking** | MockK | Mockito (for Kotlin) |
| **Coroutines** | `runTest`, `coEvery` | Blocking code in tests |
| **Data** | Fixtures & Builders | Hardcoded values everywhere |
| **Scope** | One behavior per test | Testing multiple behaviors |
| **State** | Isolated per test | Shared mutable state |