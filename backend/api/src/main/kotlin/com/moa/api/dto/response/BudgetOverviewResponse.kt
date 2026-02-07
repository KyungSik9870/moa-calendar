package com.moa.api.dto.response

import com.moa.core.domain.statistics.BudgetOverview
import java.math.BigDecimal
import java.time.LocalDate

data class BudgetOverviewResponse(
    val startDate: LocalDate,
    val endDate: LocalDate,
    val budgetStartDay: Int,
    val totalExpense: BigDecimal,
    val totalIncome: BigDecimal,
    val balance: BigDecimal,
) {

    companion object {
        fun from(overview: BudgetOverview) = BudgetOverviewResponse(
            startDate = overview.startDate,
            endDate = overview.endDate,
            budgetStartDay = overview.budgetStartDay,
            totalExpense = overview.totalExpense,
            totalIncome = overview.totalIncome,
            balance = overview.balance,
        )
    }
}
