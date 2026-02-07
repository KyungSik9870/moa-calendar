package com.moa.api.dto.request

import com.moa.core.domain.AssetType
import com.moa.core.domain.transaction.TransactionType
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import java.math.BigDecimal
import java.time.LocalDate

data class CreateTransactionRequest(

    @field:NotNull(message = "금액은 필수입니다.")
    @field:Positive(message = "금액은 0보다 커야 합니다.")
    val amount: BigDecimal,

    @field:NotNull(message = "거래 유형은 필수입니다.")
    val transactionType: TransactionType,

    val assetType: AssetType = AssetType.PERSONAL,

    @field:NotBlank(message = "카테고리는 필수입니다.")
    @field:Size(max = 30, message = "카테고리명은 30자 이하여야 합니다.")
    val categoryName: String,

    val assetSourceId: Long? = null,

    @field:NotNull(message = "날짜는 필수입니다.")
    val date: LocalDate,

    @field:Size(max = 200, message = "설명은 200자 이하여야 합니다.")
    val description: String? = null,

    val scheduleId: Long? = null,
)
