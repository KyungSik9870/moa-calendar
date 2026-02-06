package com.moa.api.dto.response

data class TokenResponse(
    val accessToken: String,
    val tokenType: String = "Bearer",
)
