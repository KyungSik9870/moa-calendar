package com.moa.api.dto.response

import com.moa.core.domain.AssetType
import com.moa.core.domain.schedule.RepeatType
import com.moa.core.domain.schedule.Schedule
import com.moa.core.domain.schedule.ScheduleCategory
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

data class ScheduleResponse(
    val id: Long,
    val groupId: Long,
    val userId: Long,
    val userNickname: String,
    val userColorCode: String,
    val title: String,
    val startDate: LocalDate,
    val endDate: LocalDate?,
    val startTime: LocalTime?,
    val endTime: LocalTime?,
    val isAllDay: Boolean,
    val assetType: AssetType,
    val category: ScheduleCategory,
    val memo: String?,
    val repeatType: RepeatType,
    val repeatGroupId: Long?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
) {

    companion object {
        fun from(schedule: Schedule): ScheduleResponse = ScheduleResponse(
            id = schedule.id,
            groupId = schedule.group.id,
            userId = schedule.user.id,
            userNickname = schedule.user.nickname,
            userColorCode = schedule.user.colorCode,
            title = schedule.title,
            startDate = schedule.startDate,
            endDate = schedule.endDate,
            startTime = schedule.startTime,
            endTime = schedule.endTime,
            isAllDay = schedule.isAllDay,
            assetType = schedule.assetType,
            category = schedule.category,
            memo = schedule.memo,
            repeatType = schedule.repeatType,
            repeatGroupId = schedule.repeatGroupId,
            createdAt = schedule.createdAt,
            updatedAt = schedule.updatedAt,
        )
    }
}
