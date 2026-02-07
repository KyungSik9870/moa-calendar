package com.moa.api.dto.response

import com.moa.core.domain.transaction.CategorySummary
import com.moa.core.domain.transaction.TransactionSummary
import com.moa.core.domain.transaction.TransactionType
import java.math.BigDecimal
import java.time.LocalDate

data class TransactionSummaryResponse(
    val startDate: LocalDate,
    val endDate: LocalDate,
    val totalExpense: BigDecimal,
    val totalIncome: BigDecimal,
    val balance: BigDecimal,
    val categoryBreakdown: List<CategoryBreakdownItem>,
) {

    data class CategoryBreakdownItem(
        val categoryName: String,
        val transactionType: TransactionType,
        val total: BigDecimal,
    )

    companion object {
        fun from(summary: TransactionSummary): TransactionSummaryResponse = TransactionSummaryResponse(
            startDate = summary.startDate,
            endDate = summary.endDate,
            totalExpense = summary.totalExpense,
            totalIncome = summary.totalIncome,
            balance = summary.balance,
            categoryBreakdown = summary.categoryBreakdown.map { item ->
                CategoryBreakdownItem(
                    categoryName = item.categoryName,
                    transactionType = item.transactionType,
                    total = item.total,
                )
            },
        )
    }
}
