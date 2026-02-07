package com.moa.core.domain.statistics

import com.moa.core.domain.group.GroupMemberRepository
import com.moa.core.domain.group.GroupMemberStatus
import com.moa.core.domain.group.GroupRepository
import com.moa.core.domain.transaction.TransactionRepository
import com.moa.core.domain.transaction.TransactionType
import com.moa.core.exception.GroupAccessDeniedException
import com.moa.core.exception.GroupNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate

@Service
@Transactional(readOnly = true)
class StatisticsService(
    private val transactionRepository: TransactionRepository,
    private val groupRepository: GroupRepository,
    private val groupMemberRepository: GroupMemberRepository,
) {

    fun getBudgetOverview(groupId: Long, userId: Long, startDate: LocalDate, endDate: LocalDate): BudgetOverview {
        verifyGroupAccess(groupId, userId)
        val group = groupRepository.findById(groupId).orElseThrow { GroupNotFoundException(groupId) }

        val totals = transactionRepository.sumByGroupIdAndDateRange(groupId, startDate, endDate)
        val totalExpense = totals[0] as BigDecimal
        val totalIncome = totals[1] as BigDecimal

        return BudgetOverview(
            startDate = startDate,
            endDate = endDate,
            budgetStartDay = group.budgetStartDay,
            totalExpense = totalExpense,
            totalIncome = totalIncome,
            balance = totalIncome - totalExpense,
        )
    }

    fun getCategoryBreakdown(groupId: Long, userId: Long, startDate: LocalDate, endDate: LocalDate): CategoryBreakdown {
        verifyGroupAccess(groupId, userId)

        val data = transactionRepository.sumByGroupIdAndDateRangeGroupByCategory(groupId, startDate, endDate)
        val items = data.map { row ->
            CategoryBreakdownItem(
                categoryName = row[0] as String,
                transactionType = TransactionType.valueOf(row[1] as String),
                total = row[2] as BigDecimal,
            )
        }

        val totalExpense = items.filter { it.transactionType == TransactionType.EXPENSE }.sumOf { it.total }
        val totalIncome = items.filter { it.transactionType == TransactionType.INCOME }.sumOf { it.total }

        return CategoryBreakdown(
            startDate = startDate,
            endDate = endDate,
            totalExpense = totalExpense,
            totalIncome = totalIncome,
            items = items,
        )
    }

    fun getDailyTrend(groupId: Long, userId: Long, startDate: LocalDate, endDate: LocalDate): DailyTrend {
        verifyGroupAccess(groupId, userId)

        val data = transactionRepository.sumByGroupIdAndDateRangeGroupByDate(groupId, startDate, endDate)
        val items = data.map { row ->
            DailyTrendItem(
                date = row[0] as LocalDate,
                transactionType = TransactionType.valueOf(row[1] as String),
                total = row[2] as BigDecimal,
            )
        }

        return DailyTrend(
            startDate = startDate,
            endDate = endDate,
            items = items,
        )
    }

    fun getMemberComparison(groupId: Long, userId: Long, startDate: LocalDate, endDate: LocalDate): MemberComparison {
        verifyGroupAccess(groupId, userId)

        val data = transactionRepository.sumByGroupIdAndDateRangeGroupByUser(groupId, startDate, endDate)
        val items = data.map { row ->
            MemberComparisonItem(
                userId = row[0] as Long,
                nickname = row[1] as String,
                colorCode = row[2] as String,
                transactionType = TransactionType.valueOf(row[3] as String),
                total = row[4] as BigDecimal,
            )
        }

        return MemberComparison(
            startDate = startDate,
            endDate = endDate,
            items = items,
        )
    }

    private fun verifyGroupAccess(groupId: Long, userId: Long) {
        if (!groupMemberRepository.existsByGroupIdAndUserIdAndStatus(groupId, userId, GroupMemberStatus.ACCEPTED)) {
            throw GroupAccessDeniedException(groupId)
        }
    }
}

data class BudgetOverview(
    val startDate: LocalDate,
    val endDate: LocalDate,
    val budgetStartDay: Int,
    val totalExpense: BigDecimal,
    val totalIncome: BigDecimal,
    val balance: BigDecimal,
)

data class CategoryBreakdown(
    val startDate: LocalDate,
    val endDate: LocalDate,
    val totalExpense: BigDecimal,
    val totalIncome: BigDecimal,
    val items: List<CategoryBreakdownItem>,
)

data class CategoryBreakdownItem(
    val categoryName: String,
    val transactionType: TransactionType,
    val total: BigDecimal,
)

data class DailyTrend(
    val startDate: LocalDate,
    val endDate: LocalDate,
    val items: List<DailyTrendItem>,
)

data class DailyTrendItem(
    val date: LocalDate,
    val transactionType: TransactionType,
    val total: BigDecimal,
)

data class MemberComparison(
    val startDate: LocalDate,
    val endDate: LocalDate,
    val items: List<MemberComparisonItem>,
)

data class MemberComparisonItem(
    val userId: Long,
    val nickname: String,
    val colorCode: String,
    val transactionType: TransactionType,
    val total: BigDecimal,
)
