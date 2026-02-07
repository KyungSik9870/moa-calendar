package com.moa.api.controller

import com.moa.api.dto.response.BudgetOverviewResponse
import com.moa.api.dto.response.CategoryBreakdownResponse
import com.moa.api.dto.response.DailyTrendResponse
import com.moa.api.dto.response.MemberComparisonResponse
import com.moa.api.security.UserPrincipal
import com.moa.core.domain.statistics.StatisticsService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
@RequestMapping("/api/v1/groups/{groupId}/statistics")
class StatisticsController(
    private val statisticsService: StatisticsService,
) {

    @GetMapping("/budget")
    fun getBudgetOverview(
        @PathVariable groupId: Long,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<BudgetOverviewResponse> {
        val overview = statisticsService.getBudgetOverview(groupId, principal.userId, startDate, endDate)
        return ResponseEntity.ok(BudgetOverviewResponse.from(overview))
    }

    @GetMapping("/category-breakdown")
    fun getCategoryBreakdown(
        @PathVariable groupId: Long,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<CategoryBreakdownResponse> {
        val breakdown = statisticsService.getCategoryBreakdown(groupId, principal.userId, startDate, endDate)
        return ResponseEntity.ok(CategoryBreakdownResponse.from(breakdown))
    }

    @GetMapping("/daily-trend")
    fun getDailyTrend(
        @PathVariable groupId: Long,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<DailyTrendResponse> {
        val trend = statisticsService.getDailyTrend(groupId, principal.userId, startDate, endDate)
        return ResponseEntity.ok(DailyTrendResponse.from(trend))
    }

    @GetMapping("/member-comparison")
    fun getMemberComparison(
        @PathVariable groupId: Long,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<MemberComparisonResponse> {
        val comparison = statisticsService.getMemberComparison(groupId, principal.userId, startDate, endDate)
        return ResponseEntity.ok(MemberComparisonResponse.from(comparison))
    }
}
