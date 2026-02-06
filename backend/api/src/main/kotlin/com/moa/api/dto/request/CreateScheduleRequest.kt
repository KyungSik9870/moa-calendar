package com.moa.api.dto.request

import com.moa.core.domain.AssetType
import com.moa.core.domain.schedule.RepeatType
import com.moa.core.domain.schedule.ScheduleCategory
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDate
import java.time.LocalTime

data class CreateScheduleRequest(

    @field:NotBlank(message = "일정 제목은 필수입니다.")
    @field:Size(max = 50, message = "일정 제목은 50자 이하여야 합니다.")
    val title: String,

    val startDate: LocalDate,

    val endDate: LocalDate? = null,

    val startTime: LocalTime? = null,

    val endTime: LocalTime? = null,

    val isAllDay: Boolean = true,

    val assetType: AssetType = AssetType.PERSONAL,

    val category: ScheduleCategory = ScheduleCategory.ETC,

    @field:Size(max = 500, message = "메모는 500자 이하여야 합니다.")
    val memo: String? = null,

    val repeatType: RepeatType = RepeatType.NONE,

    val repeatEndDate: LocalDate? = null,
)
