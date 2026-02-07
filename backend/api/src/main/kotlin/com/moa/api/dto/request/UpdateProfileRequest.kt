package com.moa.api.dto.request

import jakarta.validation.constraints.Size

data class UpdateProfileRequest(

    @field:Size(min = 2, max = 10, message = "닉네임은 2~10자여야 합니다.")
    val nickname: String? = null,

    val colorCode: String? = null,

    val personalAssetColor: String? = null,

    val profileImageUrl: String? = null,
)
