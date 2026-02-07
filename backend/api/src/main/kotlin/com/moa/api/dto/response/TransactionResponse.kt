package com.moa.api.dto.response

import com.moa.core.domain.AssetType
import com.moa.core.domain.transaction.Transaction
import com.moa.core.domain.transaction.TransactionType
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class TransactionResponse(
    val id: Long,
    val groupId: Long,
    val userId: Long,
    val userNickname: String,
    val userColorCode: String,
    val amount: BigDecimal,
    val transactionType: TransactionType,
    val assetType: AssetType,
    val categoryName: String,
    val assetSourceId: Long?,
    val assetSourceName: String?,
    val date: LocalDate,
    val description: String?,
    val scheduleId: Long?,
    val scheduleTitle: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
) {

    companion object {
        fun from(transaction: Transaction): TransactionResponse = TransactionResponse(
            id = transaction.id,
            groupId = transaction.group.id,
            userId = transaction.user.id,
            userNickname = transaction.user.nickname,
            userColorCode = transaction.user.colorCode,
            amount = transaction.amount,
            transactionType = transaction.transactionType,
            assetType = transaction.assetType,
            categoryName = transaction.categoryName,
            assetSourceId = transaction.assetSource?.id,
            assetSourceName = transaction.assetSource?.name,
            date = transaction.date,
            description = transaction.description,
            scheduleId = transaction.schedule?.id,
            scheduleTitle = transaction.schedule?.title,
            createdAt = transaction.createdAt,
            updatedAt = transaction.updatedAt,
        )
    }
}
