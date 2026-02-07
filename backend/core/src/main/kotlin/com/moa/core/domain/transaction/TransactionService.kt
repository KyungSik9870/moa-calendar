package com.moa.core.domain.transaction

import com.moa.core.domain.AssetType
import com.moa.core.domain.assetsource.AssetSourceRepository
import com.moa.core.domain.group.GroupMemberRepository
import com.moa.core.domain.group.GroupMemberStatus
import com.moa.core.domain.group.GroupRepository
import com.moa.core.domain.schedule.ScheduleRepository
import com.moa.core.domain.user.User
import com.moa.core.exception.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate

@Service
@Transactional(readOnly = true)
class TransactionService(
    private val transactionRepository: TransactionRepository,
    private val groupRepository: GroupRepository,
    private val groupMemberRepository: GroupMemberRepository,
    private val assetSourceRepository: AssetSourceRepository,
    private val scheduleRepository: ScheduleRepository,
) {

    @Transactional
    fun create(
        groupId: Long,
        user: User,
        amount: BigDecimal,
        transactionType: TransactionType,
        assetType: AssetType,
        categoryName: String,
        assetSourceId: Long?,
        date: LocalDate,
        description: String?,
        scheduleId: Long?,
    ): Transaction {
        val group = groupRepository.findById(groupId).orElseThrow { GroupNotFoundException(groupId) }
        verifyGroupAccess(groupId, user.id)

        val assetSource = assetSourceId?.let {
            assetSourceRepository.findById(it).orElseThrow { AssetSourceNotFoundException(it) }
        }
        val schedule = scheduleId?.let {
            scheduleRepository.findById(it).orElseThrow { ScheduleNotFoundException(it) }
        }

        return transactionRepository.save(
            Transaction(
                group = group,
                user = user,
                amount = amount,
                transactionType = transactionType,
                assetType = assetType,
                categoryName = categoryName,
                assetSource = assetSource,
                date = date,
                description = description,
                schedule = schedule,
            ),
        )
    }

    fun findByDateRange(
        groupId: Long,
        userId: Long,
        startDate: LocalDate,
        endDate: LocalDate,
        assetType: AssetType?,
    ): List<Transaction> {
        verifyGroupAccess(groupId, userId)
        return if (assetType != null) {
            transactionRepository.findByGroupIdAndDateRangeAndAssetType(groupId, startDate, endDate, assetType)
        } else {
            transactionRepository.findByGroupIdAndDateRange(groupId, startDate, endDate)
        }
    }

    fun findById(transactionId: Long, userId: Long): Transaction {
        val transaction = transactionRepository.findById(transactionId)
            .orElseThrow { TransactionNotFoundException(transactionId) }
        verifyGroupAccess(transaction.group.id, userId)
        return transaction
    }

    @Transactional
    fun update(
        transactionId: Long,
        userId: Long,
        amount: BigDecimal,
        transactionType: TransactionType,
        assetType: AssetType,
        categoryName: String,
        assetSourceId: Long?,
        date: LocalDate,
        description: String?,
        scheduleId: Long?,
    ): Transaction {
        val transaction = transactionRepository.findById(transactionId)
            .orElseThrow { TransactionNotFoundException(transactionId) }
        verifyGroupAccess(transaction.group.id, userId)

        val assetSource = assetSourceId?.let {
            assetSourceRepository.findById(it).orElseThrow { AssetSourceNotFoundException(it) }
        }
        val schedule = scheduleId?.let {
            scheduleRepository.findById(it).orElseThrow { ScheduleNotFoundException(it) }
        }

        transaction.update(
            amount = amount,
            transactionType = transactionType,
            assetType = assetType,
            categoryName = categoryName,
            assetSource = assetSource,
            date = date,
            description = description,
            schedule = schedule,
        )

        return transaction
    }

    @Transactional
    fun delete(transactionId: Long, userId: Long) {
        val transaction = transactionRepository.findById(transactionId)
            .orElseThrow { TransactionNotFoundException(transactionId) }
        verifyGroupAccess(transaction.group.id, userId)
        transactionRepository.delete(transaction)
    }

    fun getSummary(groupId: Long, userId: Long, startDate: LocalDate, endDate: LocalDate): TransactionSummary {
        verifyGroupAccess(groupId, userId)

        val totals = transactionRepository.sumByGroupIdAndDateRange(groupId, startDate, endDate)
        val totalExpense = totals[0] as BigDecimal
        val totalIncome = totals[1] as BigDecimal

        val categoryBreakdown = transactionRepository.sumByGroupIdAndDateRangeGroupByCategory(groupId, startDate, endDate)
            .map { row ->
                CategorySummary(
                    categoryName = row[0] as String,
                    transactionType = TransactionType.valueOf(row[1] as String),
                    total = row[2] as BigDecimal,
                )
            }

        return TransactionSummary(
            startDate = startDate,
            endDate = endDate,
            totalExpense = totalExpense,
            totalIncome = totalIncome,
            balance = totalIncome - totalExpense,
            categoryBreakdown = categoryBreakdown,
        )
    }

    private fun verifyGroupAccess(groupId: Long, userId: Long) {
        if (!groupMemberRepository.existsByGroupIdAndUserIdAndStatus(groupId, userId, GroupMemberStatus.ACCEPTED)) {
            throw GroupAccessDeniedException(groupId)
        }
    }
}

data class TransactionSummary(
    val startDate: LocalDate,
    val endDate: LocalDate,
    val totalExpense: BigDecimal,
    val totalIncome: BigDecimal,
    val balance: BigDecimal,
    val categoryBreakdown: List<CategorySummary>,
)

data class CategorySummary(
    val categoryName: String,
    val transactionType: TransactionType,
    val total: BigDecimal,
)
