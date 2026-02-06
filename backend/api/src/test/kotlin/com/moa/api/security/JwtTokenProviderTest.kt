package com.moa.api.security

import com.moa.api.config.JwtProperties
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldNotBeBlank
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class JwtTokenProviderTest {

    private lateinit var jwtTokenProvider: JwtTokenProvider

    @BeforeEach
    fun setUp() {
        val properties = JwtProperties(
            secret = "test-secret-key-for-jwt-token-testing-must-be-at-least-256-bits-long",
            accessTokenExpiry = 3600000L, // 1 hour
        )
        jwtTokenProvider = JwtTokenProvider(properties)
    }

    @Nested
    inner class GenerateAccessToken {

        @Test
        fun `should generate non-blank token`() {
            // given
            val userId = 1L
            val email = "minsu@email.com"

            // when
            val token = jwtTokenProvider.generateAccessToken(userId, email)

            // then
            token.shouldNotBeBlank()
        }
    }

    @Nested
    inner class ValidateToken {

        @Test
        fun `should return true for valid token`() {
            // given
            val token = jwtTokenProvider.generateAccessToken(1L, "minsu@email.com")

            // when
            val isValid = jwtTokenProvider.validateToken(token)

            // then
            isValid shouldBe true
        }

        @Test
        fun `should return false for tampered token`() {
            // given
            val token = jwtTokenProvider.generateAccessToken(1L, "minsu@email.com")
            val tamperedToken = token + "tampered"

            // when
            val isValid = jwtTokenProvider.validateToken(tamperedToken)

            // then
            isValid shouldBe false
        }

        @Test
        fun `should return false for expired token`() {
            // given
            val expiredProperties = JwtProperties(
                secret = "test-secret-key-for-jwt-token-testing-must-be-at-least-256-bits-long",
                accessTokenExpiry = -1000L, // already expired
            )
            val expiredProvider = JwtTokenProvider(expiredProperties)
            val token = expiredProvider.generateAccessToken(1L, "minsu@email.com")

            // when
            val isValid = jwtTokenProvider.validateToken(token)

            // then
            isValid shouldBe false
        }
    }

    @Nested
    inner class ExtractClaims {

        @Test
        fun `should extract correct user ID from token`() {
            // given
            val userId = 42L
            val token = jwtTokenProvider.generateAccessToken(userId, "minsu@email.com")

            // when
            val extractedId = jwtTokenProvider.getUserIdFromToken(token)

            // then
            extractedId shouldBe userId
        }

        @Test
        fun `should extract correct email from token`() {
            // given
            val email = "minsu@email.com"
            val token = jwtTokenProvider.generateAccessToken(1L, email)

            // when
            val extractedEmail = jwtTokenProvider.getEmailFromToken(token)

            // then
            extractedEmail shouldBe email
        }
    }
}
