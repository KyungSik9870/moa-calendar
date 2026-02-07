package com.moa.core.domain.schedule

import com.moa.core.domain.AssetType
import com.moa.core.domain.group.GroupMemberStatus
import com.moa.core.domain.group.GroupRepository
import com.moa.core.domain.group.GroupMemberRepository
import com.moa.core.domain.user.User
import com.moa.core.exception.GroupAccessDeniedException
import com.moa.core.exception.GroupNotFoundException
import com.moa.core.exception.ScheduleNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalTime
import java.time.temporal.ChronoUnit

@Service
@Transactional(readOnly = true)
class ScheduleService(
    private val scheduleRepository: ScheduleRepository,
    private val groupRepository: GroupRepository,
    private val groupMemberRepository: GroupMemberRepository,
) {

    @Transactional
    fun create(
        groupId: Long,
        user: User,
        title: String,
        startDate: LocalDate,
        endDate: LocalDate?,
        startTime: LocalTime?,
        endTime: LocalTime?,
        isAllDay: Boolean,
        assetType: AssetType,
        category: ScheduleCategory,
        memo: String?,
        repeatType: RepeatType,
        repeatEndDate: LocalDate?,
    ): Schedule {
        val group = groupRepository.findById(groupId)
            .orElseThrow { GroupNotFoundException(groupId) }
        verifyGroupAccess(groupId, user.id)

        val schedule = scheduleRepository.save(
            Schedule(
                group = group,
                user = user,
                title = title,
                startDate = startDate,
                endDate = endDate,
                startTime = startTime,
                endTime = endTime,
                isAllDay = isAllDay,
                assetType = assetType,
                category = category,
                memo = memo,
                repeatType = repeatType,
            ),
        )

        if (repeatType != RepeatType.NONE) {
            schedule.repeatGroupId = schedule.id
            val instances = generateRepeatInstances(schedule, repeatEndDate)
            if (instances.isNotEmpty()) {
                scheduleRepository.saveAll(instances)
            }
        }

        return schedule
    }

    fun findByDateRange(
        groupId: Long,
        userId: Long,
        startDate: LocalDate,
        endDate: LocalDate,
        filterUserId: Long? = null,
        filterAssetType: AssetType? = null,
    ): List<Schedule> {
        verifyGroupAccess(groupId, userId)
        return when {
            filterUserId != null -> scheduleRepository.findByGroupIdAndDateRangeAndUserId(groupId, startDate, endDate, filterUserId)
            filterAssetType != null -> scheduleRepository.findByGroupIdAndDateRangeAndAssetType(groupId, startDate, endDate, filterAssetType)
            else -> scheduleRepository.findByGroupIdAndDateRange(groupId, startDate, endDate)
        }
    }

    fun findById(scheduleId: Long, userId: Long): Schedule {
        val schedule = scheduleRepository.findById(scheduleId)
            .orElseThrow { ScheduleNotFoundException(scheduleId) }
        verifyGroupAccess(schedule.group.id, userId)
        return schedule
    }

    @Transactional
    fun update(
        scheduleId: Long,
        userId: Long,
        title: String,
        startDate: LocalDate,
        endDate: LocalDate?,
        startTime: LocalTime?,
        endTime: LocalTime?,
        isAllDay: Boolean,
        assetType: AssetType,
        category: ScheduleCategory,
        memo: String?,
    ): Schedule {
        val schedule = scheduleRepository.findById(scheduleId)
            .orElseThrow { ScheduleNotFoundException(scheduleId) }
        verifyGroupAccess(schedule.group.id, userId)

        schedule.update(
            title = title,
            startDate = startDate,
            endDate = endDate,
            startTime = startTime,
            endTime = endTime,
            isAllDay = isAllDay,
            assetType = assetType,
            category = category,
            memo = memo,
        )

        return schedule
    }

    @Transactional
    fun delete(scheduleId: Long, userId: Long) {
        val schedule = scheduleRepository.findById(scheduleId)
            .orElseThrow { ScheduleNotFoundException(scheduleId) }
        verifyGroupAccess(schedule.group.id, userId)
        scheduleRepository.delete(schedule)
    }

    @Transactional
    fun deleteRepeatGroup(repeatGroupId: Long, userId: Long) {
        val schedules = scheduleRepository.findByRepeatGroupId(repeatGroupId)
        if (schedules.isEmpty()) throw ScheduleNotFoundException(repeatGroupId)
        verifyGroupAccess(schedules.first().group.id, userId)
        scheduleRepository.deleteByRepeatGroupId(repeatGroupId)
    }

    private fun verifyGroupAccess(groupId: Long, userId: Long) {
        if (!groupMemberRepository.existsByGroupIdAndUserIdAndStatus(
                groupId, userId, GroupMemberStatus.ACCEPTED,
            )
        ) {
            throw GroupAccessDeniedException(groupId)
        }
    }

    private fun generateRepeatInstances(original: Schedule, repeatEndDate: LocalDate?): List<Schedule> {
        val effectiveEndDate = repeatEndDate ?: original.startDate.plusYears(1)
        val daysDuration = original.endDate?.let {
            ChronoUnit.DAYS.between(original.startDate, it)
        }

        val instances = mutableListOf<Schedule>()
        var currentStart = nextOccurrence(original.startDate, original.repeatType)

        while (currentStart <= effectiveEndDate && instances.size < MAX_REPEAT_INSTANCES) {
            val currentEnd = daysDuration?.let { currentStart.plusDays(it) }

            instances.add(
                Schedule(
                    group = original.group,
                    user = original.user,
                    title = original.title,
                    startDate = currentStart,
                    endDate = currentEnd,
                    startTime = original.startTime,
                    endTime = original.endTime,
                    isAllDay = original.isAllDay,
                    assetType = original.assetType,
                    category = original.category,
                    memo = original.memo,
                    repeatType = original.repeatType,
                    repeatGroupId = original.id,
                ),
            )

            currentStart = nextOccurrence(currentStart, original.repeatType)
        }

        return instances
    }

    private fun nextOccurrence(date: LocalDate, repeatType: RepeatType): LocalDate =
        when (repeatType) {
            RepeatType.DAILY -> date.plusDays(1)
            RepeatType.WEEKLY -> date.plusWeeks(1)
            RepeatType.MONTHLY -> date.plusMonths(1)
            RepeatType.YEARLY -> date.plusYears(1)
            RepeatType.NONE -> date
        }

    companion object {
        private const val MAX_REPEAT_INSTANCES = 365
    }
}
