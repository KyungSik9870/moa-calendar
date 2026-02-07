package com.moa.api.dto.response

import com.moa.core.domain.statistics.MemberComparison
import com.moa.core.domain.transaction.TransactionType
import java.math.BigDecimal
import java.time.LocalDate

data class MemberComparisonResponse(
    val startDate: LocalDate,
    val endDate: LocalDate,
    val items: List<MemberComparisonItemResponse>,
) {

    data class MemberComparisonItemResponse(
        val userId: Long,
        val nickname: String,
        val colorCode: String,
        val transactionType: TransactionType,
        val total: BigDecimal,
    )

    companion object {
        fun from(comparison: MemberComparison) = MemberComparisonResponse(
            startDate = comparison.startDate,
            endDate = comparison.endDate,
            items = comparison.items.map { item ->
                MemberComparisonItemResponse(
                    userId = item.userId,
                    nickname = item.nickname,
                    colorCode = item.colorCode,
                    transactionType = item.transactionType,
                    total = item.total,
                )
            },
        )
    }
}
