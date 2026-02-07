package com.moa.api.dto.request

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank

data class InviteRequest(

    @field:NotBlank(message = "이메일은 필수입니다.")
    @field:Email(message = "유효한 이메일 형식이어야 합니다.")
    val email: String,
)
