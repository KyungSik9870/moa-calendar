package com.moa.api.dto.response

data class SignUpResponse(
    val user: UserResponse,
    val token: TokenResponse,
)
