package com.moa.api.dto.request

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpdateAssetSourceRequest(

    @field:NotBlank(message = "자산 이름은 필수입니다.")
    @field:Size(max = 30, message = "자산 이름은 30자 이하여야 합니다.")
    val name: String,

    @field:Size(max = 100, message = "설명은 100자 이하여야 합니다.")
    val description: String? = null,
)
