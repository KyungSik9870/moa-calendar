package com.moa.api.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.moa.api.dto.request.LoginRequest
import com.moa.api.dto.request.SignUpRequest
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Nested
    inner class SignUp {

        @Test
        fun `should return 201 with user and token when valid signup request`() {
            // given
            val request = SignUpRequest(
                email = "minsu@email.com",
                password = "password123",
                nickname = "민수",
                colorCode = "#5B9FFF",
            )

            // when & then
            mockMvc.post("/api/v1/auth/signup") {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(request)
            }.andExpect {
                status { isCreated() }
                jsonPath("$.user.email") { value("minsu@email.com") }
                jsonPath("$.user.nickname") { value("민수") }
                jsonPath("$.user.color_code") { value("#5B9FFF") }
                jsonPath("$.user.personal_asset_color") { value("#E91E63") }
                jsonPath("$.token.access_token") { isNotEmpty() }
                jsonPath("$.token.token_type") { value("Bearer") }
            }
        }

        @Test
        fun `should return 409 when email already exists`() {
            // given - first signup
            val request = SignUpRequest(
                email = "duplicate@email.com",
                password = "password123",
                nickname = "테스트",
                colorCode = "#5B9FFF",
            )

            mockMvc.post("/api/v1/auth/signup") {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(request)
            }.andExpect {
                status { isCreated() }
            }

            // when - duplicate signup & then
            mockMvc.post("/api/v1/auth/signup") {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(request)
            }.andExpect {
                status { isConflict() }
                jsonPath("$.code") { value("DUPLICATE_EMAIL") }
            }
        }

        @Test
        fun `should return 400 when email is blank`() {
            // given
            val request = SignUpRequest(
                email = "",
                password = "password123",
                nickname = "민수",
                colorCode = "#5B9FFF",
            )

            // when & then
            mockMvc.post("/api/v1/auth/signup") {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(request)
            }.andExpect {
                status { isBadRequest() }
                jsonPath("$.code") { value("INVALID_INPUT") }
                jsonPath("$.errors") { isNotEmpty() }
            }
        }

        @Test
        fun `should return 400 when password is too short`() {
            // given
            val request = SignUpRequest(
                email = "test@email.com",
                password = "short",
                nickname = "민수",
                colorCode = "#5B9FFF",
            )

            // when & then
            mockMvc.post("/api/v1/auth/signup") {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(request)
            }.andExpect {
                status { isBadRequest() }
                jsonPath("$.errors[0].field") { value("password") }
            }
        }

        @Test
        fun `should return 400 when invalid color code is provided`() {
            // given
            val request = SignUpRequest(
                email = "color@email.com",
                password = "password123",
                nickname = "민수",
                colorCode = "#INVALID",
            )

            // when & then
            mockMvc.post("/api/v1/auth/signup") {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(request)
            }.andExpect {
                status { isBadRequest() }
            }
        }
    }

    @Nested
    inner class Login {

        @Test
        fun `should return 200 with token when valid credentials`() {
            // given - register first
            val signUpRequest = SignUpRequest(
                email = "login-test@email.com",
                password = "password123",
                nickname = "로그인",
                colorCode = "#FF9800",
            )

            mockMvc.post("/api/v1/auth/signup") {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(signUpRequest)
            }

            val loginRequest = LoginRequest(
                email = "login-test@email.com",
                password = "password123",
            )

            // when & then
            mockMvc.post("/api/v1/auth/login") {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(loginRequest)
            }.andExpect {
                status { isOk() }
                jsonPath("$.user.email") { value("login-test@email.com") }
                jsonPath("$.token.access_token") { isNotEmpty() }
            }
        }

        @Test
        fun `should return 401 when email does not exist`() {
            // given
            val request = LoginRequest(
                email = "nonexistent@email.com",
                password = "password123",
            )

            // when & then
            mockMvc.post("/api/v1/auth/login") {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(request)
            }.andExpect {
                status { isUnauthorized() }
                jsonPath("$.code") { value("INVALID_CREDENTIALS") }
            }
        }

        @Test
        fun `should return 401 when password is wrong`() {
            // given - register first
            val signUpRequest = SignUpRequest(
                email = "wrong-pw@email.com",
                password = "password123",
                nickname = "테스트",
                colorCode = "#4CAF50",
            )

            mockMvc.post("/api/v1/auth/signup") {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(signUpRequest)
            }

            val loginRequest = LoginRequest(
                email = "wrong-pw@email.com",
                password = "wrongPassword",
            )

            // when & then
            mockMvc.post("/api/v1/auth/login") {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(loginRequest)
            }.andExpect {
                status { isUnauthorized() }
                jsonPath("$.code") { value("INVALID_CREDENTIALS") }
            }
        }
    }
}
