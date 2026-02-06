package com.moa.api.controller

import com.moa.api.dto.request.CreateScheduleRequest
import com.moa.api.dto.request.UpdateScheduleRequest
import com.moa.api.dto.response.ScheduleResponse
import com.moa.api.security.UserPrincipal
import com.moa.core.domain.schedule.ScheduleService
import com.moa.core.domain.user.UserService
import jakarta.validation.Valid
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
@RequestMapping("/api/v1/groups/{groupId}/schedules")
class ScheduleController(
    private val scheduleService: ScheduleService,
    private val userService: UserService,
) {

    @PostMapping
    fun createSchedule(
        @PathVariable groupId: Long,
        @Valid @RequestBody request: CreateScheduleRequest,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<ScheduleResponse> {
        val user = userService.findById(principal.userId)

        val schedule = scheduleService.create(
            groupId = groupId,
            user = user,
            title = request.title,
            startDate = request.startDate,
            endDate = request.endDate,
            startTime = request.startTime,
            endTime = request.endTime,
            isAllDay = request.isAllDay,
            assetType = request.assetType,
            category = request.category,
            memo = request.memo,
            repeatType = request.repeatType,
            repeatEndDate = request.repeatEndDate,
        )

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ScheduleResponse.from(schedule))
    }

    @GetMapping
    fun getSchedules(
        @PathVariable groupId: Long,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<List<ScheduleResponse>> {
        val schedules = scheduleService.findByDateRange(groupId, principal.userId, startDate, endDate)
        return ResponseEntity.ok(schedules.map(ScheduleResponse::from))
    }

    @GetMapping("/{scheduleId}")
    fun getSchedule(
        @PathVariable groupId: Long,
        @PathVariable scheduleId: Long,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<ScheduleResponse> {
        val schedule = scheduleService.findById(scheduleId, principal.userId)
        return ResponseEntity.ok(ScheduleResponse.from(schedule))
    }

    @PutMapping("/{scheduleId}")
    fun updateSchedule(
        @PathVariable groupId: Long,
        @PathVariable scheduleId: Long,
        @Valid @RequestBody request: UpdateScheduleRequest,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<ScheduleResponse> {
        val schedule = scheduleService.update(
            scheduleId = scheduleId,
            userId = principal.userId,
            title = request.title,
            startDate = request.startDate,
            endDate = request.endDate,
            startTime = request.startTime,
            endTime = request.endTime,
            isAllDay = request.isAllDay,
            assetType = request.assetType,
            category = request.category,
            memo = request.memo,
        )

        return ResponseEntity.ok(ScheduleResponse.from(schedule))
    }

    @DeleteMapping("/{scheduleId}")
    fun deleteSchedule(
        @PathVariable groupId: Long,
        @PathVariable scheduleId: Long,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<Void> {
        scheduleService.delete(scheduleId, principal.userId)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/repeat-group/{repeatGroupId}")
    fun deleteRepeatGroup(
        @PathVariable groupId: Long,
        @PathVariable repeatGroupId: Long,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<Void> {
        scheduleService.deleteRepeatGroup(repeatGroupId, principal.userId)
        return ResponseEntity.noContent().build()
    }
}
