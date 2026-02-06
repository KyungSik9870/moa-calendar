package com.moa.api.controller

import com.moa.api.dto.request.LoginRequest
import com.moa.api.dto.request.SignUpRequest
import com.moa.api.dto.response.SignUpResponse
import com.moa.api.dto.response.TokenResponse
import com.moa.api.dto.response.UserResponse
import com.moa.api.security.JwtTokenProvider
import com.moa.core.domain.user.UserService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val userService: UserService,
    private val jwtTokenProvider: JwtTokenProvider,
) {

    @PostMapping("/signup")
    fun signUp(@Valid @RequestBody request: SignUpRequest): ResponseEntity<SignUpResponse> {
        val user = userService.signUp(
            email = request.email,
            rawPassword = request.password,
            nickname = request.nickname,
            colorCode = request.colorCode,
            profileImageUrl = request.profileImageUrl,
        )

        val token = jwtTokenProvider.generateAccessToken(user.id, user.email)

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(
                SignUpResponse(
                    user = UserResponse.from(user),
                    token = TokenResponse(accessToken = token),
                ),
            )
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<SignUpResponse> {
        val user = userService.authenticate(
            email = request.email,
            rawPassword = request.password,
        )

        val token = jwtTokenProvider.generateAccessToken(user.id, user.email)

        return ResponseEntity.ok(
            SignUpResponse(
                user = UserResponse.from(user),
                token = TokenResponse(accessToken = token),
            ),
        )
    }
}
