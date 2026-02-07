package com.moa.api.dto.request

import jakarta.validation.constraints.Size
import org.hibernate.validator.constraints.Range

data class UpdateGroupRequest(

    @field:Size(max = 30, message = "캘린더 이름은 30자 이하여야 합니다.")
    val name: String? = null,

    val jointAssetColor: String? = null,

    @field:Range(min = 1, max = 28, message = "가계부 시작일은 1~28 사이여야 합니다.")
    val budgetStartDay: Int? = null,
)
