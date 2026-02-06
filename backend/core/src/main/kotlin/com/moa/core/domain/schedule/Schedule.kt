package com.moa.core.domain.schedule

import com.moa.core.domain.AssetType
import com.moa.core.domain.BaseEntity
import com.moa.core.domain.group.Group
import com.moa.core.domain.user.User
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Index
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.LocalDate
import java.time.LocalTime

@Entity
@Table(
    name = "schedules",
    indexes = [Index(name = "idx_schedule_group_start_date", columnList = "group_id, start_date")],
)
class Schedule(

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    val group: Group,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Column(nullable = false, length = 50)
    var title: String,

    @Column(name = "start_date", nullable = false)
    var startDate: LocalDate,

    @Column(name = "end_date")
    var endDate: LocalDate? = null,

    @Column(name = "start_time")
    var startTime: LocalTime? = null,

    @Column(name = "end_time")
    var endTime: LocalTime? = null,

    @Column(name = "is_all_day", nullable = false)
    var isAllDay: Boolean = true,

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_type", nullable = false, length = 10)
    var assetType: AssetType = AssetType.PERSONAL,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var category: ScheduleCategory = ScheduleCategory.ETC,

    @Column(length = 500)
    var memo: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "repeat_type", nullable = false, length = 10)
    val repeatType: RepeatType = RepeatType.NONE,

    @Column(name = "repeat_group_id")
    var repeatGroupId: Long? = null,

) : BaseEntity() {

    init {
        require(title.isNotBlank()) { "일정 제목은 필수입니다." }
        require(title.length <= 50) { "일정 제목은 50자 이하여야 합니다." }
        endDate?.let { require(it >= startDate) { "종료일은 시작일 이후여야 합니다." } }
        if (!isAllDay) {
            requireNotNull(startTime) { "종일 일정이 아닌 경우 시작 시간은 필수입니다." }
            requireNotNull(endTime) { "종일 일정이 아닌 경우 종료 시간은 필수입니다." }
        }
    }

    fun update(
        title: String,
        startDate: LocalDate,
        endDate: LocalDate?,
        startTime: LocalTime?,
        endTime: LocalTime?,
        isAllDay: Boolean,
        assetType: AssetType,
        category: ScheduleCategory,
        memo: String?,
    ) {
        require(title.isNotBlank()) { "일정 제목은 필수입니다." }
        require(title.length <= 50) { "일정 제목은 50자 이하여야 합니다." }
        endDate?.let { require(it >= startDate) { "종료일은 시작일 이후여야 합니다." } }
        if (!isAllDay) {
            requireNotNull(startTime) { "종일 일정이 아닌 경우 시작 시간은 필수입니다." }
            requireNotNull(endTime) { "종일 일정이 아닌 경우 종료 시간은 필수입니다." }
        }

        this.title = title
        this.startDate = startDate
        this.endDate = endDate
        this.startTime = if (isAllDay) null else startTime
        this.endTime = if (isAllDay) null else endTime
        this.isAllDay = isAllDay
        this.assetType = assetType
        this.category = category
        this.memo = memo
    }
}
