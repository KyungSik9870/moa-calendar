package com.moa.api.dto.response

import com.moa.core.domain.statistics.CategoryBreakdown
import com.moa.core.domain.transaction.TransactionType
import java.math.BigDecimal
import java.time.LocalDate

data class CategoryBreakdownResponse(
    val startDate: LocalDate,
    val endDate: LocalDate,
    val totalExpense: BigDecimal,
    val totalIncome: BigDecimal,
    val items: List<CategoryBreakdownItemResponse>,
) {

    data class CategoryBreakdownItemResponse(
        val categoryName: String,
        val transactionType: TransactionType,
        val total: BigDecimal,
    )

    companion object {
        fun from(breakdown: CategoryBreakdown) = CategoryBreakdownResponse(
            startDate = breakdown.startDate,
            endDate = breakdown.endDate,
            totalExpense = breakdown.totalExpense,
            totalIncome = breakdown.totalIncome,
            items = breakdown.items.map { item ->
                CategoryBreakdownItemResponse(
                    categoryName = item.categoryName,
                    transactionType = item.transactionType,
                    total = item.total,
                )
            },
        )
    }
}
