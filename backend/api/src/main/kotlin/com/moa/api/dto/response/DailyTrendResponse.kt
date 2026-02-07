package com.moa.api.dto.response

import com.moa.core.domain.statistics.DailyTrend
import com.moa.core.domain.transaction.TransactionType
import java.math.BigDecimal
import java.time.LocalDate

data class DailyTrendResponse(
    val startDate: LocalDate,
    val endDate: LocalDate,
    val items: List<DailyTrendItemResponse>,
) {

    data class DailyTrendItemResponse(
        val date: LocalDate,
        val transactionType: TransactionType,
        val total: BigDecimal,
    )

    companion object {
        fun from(trend: DailyTrend) = DailyTrendResponse(
            startDate = trend.startDate,
            endDate = trend.endDate,
            items = trend.items.map { item ->
                DailyTrendItemResponse(
                    date = item.date,
                    transactionType = item.transactionType,
                    total = item.total,
                )
            },
        )
    }
}
