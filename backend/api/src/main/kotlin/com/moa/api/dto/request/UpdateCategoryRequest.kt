package com.moa.api.dto.request

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpdateCategoryRequest(

    @field:NotBlank(message = "카테고리 이름은 필수입니다.")
    @field:Size(max = 30, message = "카테고리 이름은 30자 이하여야 합니다.")
    val name: String,

    @field:Size(max = 10)
    val icon: String? = null,
)
