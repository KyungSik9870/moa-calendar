package com.moa.core.domain.user

import com.moa.core.exception.DuplicateEmailException
import com.moa.core.exception.InvalidCredentialsException
import com.moa.core.exception.UserNotFoundException
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldNotContain
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import java.util.Optional

class UserServiceTest {

    private lateinit var userRepository: UserRepository
    private lateinit var passwordEncoder: PasswordEncoder
    private lateinit var userService: UserService

    @BeforeEach
    fun setUp() {
        userRepository = mockk()
        passwordEncoder = BCryptPasswordEncoder()
        userService = UserService(userRepository, passwordEncoder)
    }

    @Nested
    inner class SignUp {

        @Test
        fun `should create user with encoded password when valid data is provided`() {
            // given
            val email = "minsu@email.com"
            val rawPassword = "password123"
            val nickname = "민수"
            val colorCode = "#5B9FFF"

            every { userRepository.existsByEmail(email) } returns false

            val savedUserSlot = slot<User>()
            every { userRepository.save(capture(savedUserSlot)) } answers { savedUserSlot.captured }

            // when
            val result = userService.signUp(email, rawPassword, nickname, colorCode)

            // then
            result.email shouldBe email
            result.nickname shouldBe nickname
            result.colorCode shouldBe colorCode
            result.password shouldNotContain rawPassword
            result.personalAssetColor shouldBe User.DEFAULT_PERSONAL_ASSET_COLOR

            verify(exactly = 1) { userRepository.existsByEmail(email) }
            verify(exactly = 1) { userRepository.save(any()) }
        }

        @Test
        fun `should throw DuplicateEmailException when email already exists`() {
            // given
            val email = "existing@email.com"

            every { userRepository.existsByEmail(email) } returns true

            // when & then
            shouldThrow<DuplicateEmailException> {
                userService.signUp(email, "password123", "테스트", "#5B9FFF")
            }.message shouldBe "이미 사용 중인 이메일입니다: $email"
        }

        @Test
        fun `should throw IllegalArgumentException when nickname is too short`() {
            // given
            every { userRepository.existsByEmail(any()) } returns false

            // when & then
            shouldThrow<IllegalArgumentException> {
                userService.signUp("test@email.com", "password123", "민", "#5B9FFF")
            }.message shouldBe "닉네임은 2~10자여야 합니다."
        }

        @Test
        fun `should throw IllegalArgumentException when invalid color code is provided`() {
            // given
            every { userRepository.existsByEmail(any()) } returns false

            // when & then
            shouldThrow<IllegalArgumentException> {
                userService.signUp("test@email.com", "password123", "민수", "#INVALID")
            }.message shouldBe "유효하지 않은 색상 코드입니다: #INVALID"
        }
    }

    @Nested
    inner class Authenticate {

        @Test
        fun `should return user when credentials are valid`() {
            // given
            val email = "minsu@email.com"
            val rawPassword = "password123"
            val encodedPassword = passwordEncoder.encode(rawPassword)

            val user = User(
                email = email,
                password = encodedPassword,
                nickname = "민수",
                colorCode = "#5B9FFF",
            )

            every { userRepository.findByEmail(email) } returns user

            // when
            val result = userService.authenticate(email, rawPassword)

            // then
            result.email shouldBe email
            result.nickname shouldBe "민수"
        }

        @Test
        fun `should throw InvalidCredentialsException when email does not exist`() {
            // given
            every { userRepository.findByEmail(any()) } returns null

            // when & then
            shouldThrow<InvalidCredentialsException> {
                userService.authenticate("unknown@email.com", "password123")
            }
        }

        @Test
        fun `should throw InvalidCredentialsException when password is wrong`() {
            // given
            val user = User(
                email = "minsu@email.com",
                password = passwordEncoder.encode("correctPassword"),
                nickname = "민수",
                colorCode = "#5B9FFF",
            )

            every { userRepository.findByEmail("minsu@email.com") } returns user

            // when & then
            shouldThrow<InvalidCredentialsException> {
                userService.authenticate("minsu@email.com", "wrongPassword")
            }
        }
    }

    @Nested
    inner class FindById {

        @Test
        fun `should return user when valid ID is provided`() {
            // given
            val user = User(
                email = "minsu@email.com",
                password = "encoded",
                nickname = "민수",
                colorCode = "#5B9FFF",
            )

            every { userRepository.findById(1L) } returns Optional.of(user)

            // when
            val result = userService.findById(1L)

            // then
            result shouldNotBe null
            result.email shouldBe "minsu@email.com"
        }

        @Test
        fun `should throw UserNotFoundException when ID does not exist`() {
            // given
            every { userRepository.findById(999L) } returns Optional.empty()

            // when & then
            shouldThrow<UserNotFoundException> {
                userService.findById(999L)
            }
        }
    }
}
