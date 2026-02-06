package com.moa.api.exception

import java.time.LocalDateTime

data class ErrorResponse(
    val status: Int,
    val code: String,
    val message: String,
    val timestamp: LocalDateTime = LocalDateTime.now(),
    val errors: List<FieldError> = emptyList(),
) {
    data class FieldError(
        val field: String,
        val message: String,
    )
}
