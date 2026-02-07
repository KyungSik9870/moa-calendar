package com.moa.core.domain.transaction

import com.moa.core.domain.AssetType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDate

interface TransactionRepository : JpaRepository<Transaction, Long> {

    @Query(
        """
        SELECT t FROM Transaction t
        JOIN FETCH t.user
        LEFT JOIN FETCH t.assetSource
        LEFT JOIN FETCH t.schedule
        WHERE t.group.id = :groupId
        AND t.date >= :startDate
        AND t.date <= :endDate
        ORDER BY t.date DESC, t.createdAt DESC
        """,
    )
    fun findByGroupIdAndDateRange(
        @Param("groupId") groupId: Long,
        @Param("startDate") startDate: LocalDate,
        @Param("endDate") endDate: LocalDate,
    ): List<Transaction>

    @Query(
        """
        SELECT t FROM Transaction t
        JOIN FETCH t.user
        LEFT JOIN FETCH t.assetSource
        LEFT JOIN FETCH t.schedule
        WHERE t.group.id = :groupId
        AND t.date >= :startDate
        AND t.date <= :endDate
        AND t.assetType = :assetType
        ORDER BY t.date DESC, t.createdAt DESC
        """,
    )
    fun findByGroupIdAndDateRangeAndAssetType(
        @Param("groupId") groupId: Long,
        @Param("startDate") startDate: LocalDate,
        @Param("endDate") endDate: LocalDate,
        @Param("assetType") assetType: AssetType,
    ): List<Transaction>

    fun existsByAssetSourceId(assetSourceId: Long): Boolean

    fun countByAssetSourceId(assetSourceId: Long): Long

    @Query(
        """
        SELECT COALESCE(SUM(CASE WHEN t.transactionType = 'EXPENSE' THEN t.amount ELSE 0 END), 0),
               COALESCE(SUM(CASE WHEN t.transactionType = 'INCOME' THEN t.amount ELSE 0 END), 0)
        FROM Transaction t
        WHERE t.group.id = :groupId
        AND t.date >= :startDate
        AND t.date <= :endDate
        """,
    )
    fun sumByGroupIdAndDateRange(
        @Param("groupId") groupId: Long,
        @Param("startDate") startDate: LocalDate,
        @Param("endDate") endDate: LocalDate,
    ): Array<Any>

    @Query(
        """
        SELECT t.categoryName, t.transactionType, COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.group.id = :groupId
        AND t.date >= :startDate
        AND t.date <= :endDate
        GROUP BY t.categoryName, t.transactionType
        ORDER BY SUM(t.amount) DESC
        """,
    )
    fun sumByGroupIdAndDateRangeGroupByCategory(
        @Param("groupId") groupId: Long,
        @Param("startDate") startDate: LocalDate,
        @Param("endDate") endDate: LocalDate,
    ): List<Array<Any>>

    @Query(
        """
        SELECT t.date, t.transactionType, COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.group.id = :groupId
        AND t.date >= :startDate
        AND t.date <= :endDate
        GROUP BY t.date, t.transactionType
        ORDER BY t.date ASC
        """,
    )
    fun sumByGroupIdAndDateRangeGroupByDate(
        @Param("groupId") groupId: Long,
        @Param("startDate") startDate: LocalDate,
        @Param("endDate") endDate: LocalDate,
    ): List<Array<Any>>

    @Query(
        """
        SELECT t.user.id, t.user.nickname, t.user.colorCode, t.transactionType, COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.group.id = :groupId
        AND t.date >= :startDate
        AND t.date <= :endDate
        GROUP BY t.user.id, t.user.nickname, t.user.colorCode, t.transactionType
        ORDER BY SUM(t.amount) DESC
        """,
    )
    fun sumByGroupIdAndDateRangeGroupByUser(
        @Param("groupId") groupId: Long,
        @Param("startDate") startDate: LocalDate,
        @Param("endDate") endDate: LocalDate,
    ): List<Array<Any>>
}
