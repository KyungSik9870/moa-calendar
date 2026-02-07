package com.moa.api.dto.request

import com.moa.core.domain.assetsource.AssetSourceType
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class CreateAssetSourceRequest(

    @field:NotBlank(message = "자산 이름은 필수입니다.")
    @field:Size(max = 30, message = "자산 이름은 30자 이하여야 합니다.")
    val name: String,

    @field:NotNull(message = "자산 유형은 필수입니다.")
    val type: AssetSourceType,

    @field:Size(max = 100, message = "설명은 100자 이하여야 합니다.")
    val description: String? = null,
)
