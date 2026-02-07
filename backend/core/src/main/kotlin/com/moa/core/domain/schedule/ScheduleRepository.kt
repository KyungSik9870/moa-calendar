package com.moa.core.domain.schedule

import com.moa.core.domain.AssetType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDate

interface ScheduleRepository : JpaRepository<Schedule, Long> {

    @Query(
        """
        SELECT s FROM Schedule s
        JOIN FETCH s.user
        WHERE s.group.id = :groupId
        AND s.startDate <= :endDate
        AND COALESCE(s.endDate, s.startDate) >= :startDate
        ORDER BY s.startDate, s.startTime
        """,
    )
    fun findByGroupIdAndDateRange(
        @Param("groupId") groupId: Long,
        @Param("startDate") startDate: LocalDate,
        @Param("endDate") endDate: LocalDate,
    ): List<Schedule>

    @Query(
        """
        SELECT s FROM Schedule s
        JOIN FETCH s.user
        WHERE s.group.id = :groupId
        AND s.startDate <= :endDate
        AND COALESCE(s.endDate, s.startDate) >= :startDate
        AND s.user.id = :userId
        ORDER BY s.startDate, s.startTime
        """,
    )
    fun findByGroupIdAndDateRangeAndUserId(
        @Param("groupId") groupId: Long,
        @Param("startDate") startDate: LocalDate,
        @Param("endDate") endDate: LocalDate,
        @Param("userId") userId: Long,
    ): List<Schedule>

    @Query(
        """
        SELECT s FROM Schedule s
        JOIN FETCH s.user
        WHERE s.group.id = :groupId
        AND s.startDate <= :endDate
        AND COALESCE(s.endDate, s.startDate) >= :startDate
        AND s.assetType = :assetType
        ORDER BY s.startDate, s.startTime
        """,
    )
    fun findByGroupIdAndDateRangeAndAssetType(
        @Param("groupId") groupId: Long,
        @Param("startDate") startDate: LocalDate,
        @Param("endDate") endDate: LocalDate,
        @Param("assetType") assetType: AssetType,
    ): List<Schedule>

    fun findByRepeatGroupId(repeatGroupId: Long): List<Schedule>

    fun deleteByRepeatGroupId(repeatGroupId: Long)
}
