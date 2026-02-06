package com.moa.api.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.moa.api.dto.request.CreateScheduleRequest
import com.moa.api.dto.request.UpdateScheduleRequest
import com.moa.api.security.JwtTokenProvider
import com.moa.core.domain.AssetType
import com.moa.core.domain.group.Group
import com.moa.core.domain.group.GroupMember
import com.moa.core.domain.group.GroupMemberRepository
import com.moa.core.domain.group.GroupMemberStatus
import com.moa.core.domain.group.GroupRepository
import com.moa.core.domain.group.GroupRole
import com.moa.core.domain.group.GroupType
import com.moa.core.domain.schedule.RepeatType
import com.moa.core.domain.schedule.Schedule
import com.moa.core.domain.schedule.ScheduleCategory
import com.moa.core.domain.schedule.ScheduleRepository
import com.moa.core.domain.user.User
import com.moa.core.domain.user.UserRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.put
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ScheduleControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var groupRepository: GroupRepository

    @Autowired
    private lateinit var groupMemberRepository: GroupMemberRepository

    @Autowired
    private lateinit var scheduleRepository: ScheduleRepository

    @Autowired
    private lateinit var jwtTokenProvider: JwtTokenProvider

    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder

    private lateinit var testUser: User
    private lateinit var testGroup: Group
    private lateinit var testToken: String

    @BeforeEach
    fun setUp() {
        testUser = userRepository.save(
            User(
                email = "schedule-test@email.com",
                password = passwordEncoder.encode("password123"),
                nickname = "테스트유저",
                colorCode = "#5B9FFF",
            ),
        )

        testGroup = groupRepository.save(
            Group(
                name = "테스트 캘린더",
                type = GroupType.PERSONAL,
                host = testUser,
            ),
        )

        groupMemberRepository.save(
            GroupMember(
                group = testGroup,
                user = testUser,
                role = GroupRole.HOST,
                status = GroupMemberStatus.ACCEPTED,
                joinedAt = LocalDateTime.now(),
            ),
        )

        testToken = jwtTokenProvider.generateAccessToken(testUser.id, testUser.email)
    }

    private fun baseUrl(): String = "/api/v1/groups/${testGroup.id}/schedules"

    @Nested
    inner class CreateSchedule {

        @Test
        fun `should return 201 when creating an all-day schedule`() {
            // given
            val request = CreateScheduleRequest(
                title = "치과 예약",
                startDate = LocalDate.of(2026, 2, 14),
                isAllDay = true,
                assetType = AssetType.PERSONAL,
                category = ScheduleCategory.HOSPITAL,
                memo = "3시 예약",
            )

            // when & then
            mockMvc.post(baseUrl()) {
                header("Authorization", "Bearer $testToken")
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(request)
            }.andExpect {
                status { isCreated() }
                jsonPath("$.title") { value("치과 예약") }
                jsonPath("$.is_all_day") { value(true) }
                jsonPath("$.asset_type") { value("PERSONAL") }
                jsonPath("$.category") { value("HOSPITAL") }
                jsonPath("$.memo") { value("3시 예약") }
                jsonPath("$.user_nickname") { value("테스트유저") }
                jsonPath("$.user_color_code") { value("#5B9FFF") }
                jsonPath("$.repeat_type") { value("NONE") }
            }
        }

        @Test
        fun `should return 201 when creating a time-specific schedule`() {
            // given
            val request = CreateScheduleRequest(
                title = "저녁 약속",
                startDate = LocalDate.of(2026, 2, 14),
                startTime = LocalTime.of(19, 0),
                endTime = LocalTime.of(21, 0),
                isAllDay = false,
                category = ScheduleCategory.APPOINTMENT,
            )

            // when & then
            mockMvc.post(baseUrl()) {
                header("Authorization", "Bearer $testToken")
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(request)
            }.andExpect {
                status { isCreated() }
                jsonPath("$.is_all_day") { value(false) }
                jsonPath("$.start_time") { isNotEmpty() }
                jsonPath("$.end_time") { isNotEmpty() }
            }
        }

        @Test
        fun `should return 201 when creating a multi-day schedule`() {
            // given
            val request = CreateScheduleRequest(
                title = "제주도 여행",
                startDate = LocalDate.of(2026, 3, 1),
                endDate = LocalDate.of(2026, 3, 3),
                isAllDay = true,
                category = ScheduleCategory.TRAVEL,
            )

            // when & then
            mockMvc.post(baseUrl()) {
                header("Authorization", "Bearer $testToken")
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(request)
            }.andExpect {
                status { isCreated() }
                jsonPath("$.start_date") { value("2026-03-01") }
                jsonPath("$.end_date") { value("2026-03-03") }
            }
        }

        @Test
        fun `should return 201 when creating a weekly repeat schedule`() {
            // given
            val request = CreateScheduleRequest(
                title = "주간 회의",
                startDate = LocalDate.of(2026, 2, 1),
                startTime = LocalTime.of(10, 0),
                endTime = LocalTime.of(11, 0),
                isAllDay = false,
                assetType = AssetType.JOINT,
                category = ScheduleCategory.WORK,
                repeatType = RepeatType.WEEKLY,
                repeatEndDate = LocalDate.of(2026, 3, 1),
            )

            // when & then
            mockMvc.post(baseUrl()) {
                header("Authorization", "Bearer $testToken")
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(request)
            }.andExpect {
                status { isCreated() }
                jsonPath("$.repeat_type") { value("WEEKLY") }
                jsonPath("$.repeat_group_id") { isNotEmpty() }
            }
        }

        @Test
        fun `should return 400 when title is blank`() {
            // given
            val request = CreateScheduleRequest(
                title = "",
                startDate = LocalDate.of(2026, 2, 14),
            )

            // when & then
            mockMvc.post(baseUrl()) {
                header("Authorization", "Bearer $testToken")
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(request)
            }.andExpect {
                status { isBadRequest() }
            }
        }

        @Test
        fun `should return 403 when user is not group member`() {
            // given
            val otherUser = userRepository.save(
                User(
                    email = "other@email.com",
                    password = passwordEncoder.encode("password123"),
                    nickname = "다른유저",
                    colorCode = "#FF9800",
                ),
            )
            val otherToken = jwtTokenProvider.generateAccessToken(otherUser.id, otherUser.email)

            val request = CreateScheduleRequest(
                title = "테스트",
                startDate = LocalDate.of(2026, 2, 14),
            )

            // when & then
            mockMvc.post(baseUrl()) {
                header("Authorization", "Bearer $otherToken")
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(request)
            }.andExpect {
                status { isForbidden() }
                jsonPath("$.code") { value("GROUP_ACCESS_DENIED") }
            }
        }

        @Test
        fun `should return 403 when no token provided`() {
            // given
            val request = CreateScheduleRequest(
                title = "테스트",
                startDate = LocalDate.of(2026, 2, 14),
            )

            // when & then
            mockMvc.post(baseUrl()) {
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(request)
            }.andExpect {
                status { isForbidden() }
            }
        }
    }

    @Nested
    inner class GetSchedules {

        @Test
        fun `should return schedules within date range`() {
            // given
            scheduleRepository.save(
                Schedule(
                    group = testGroup,
                    user = testUser,
                    title = "2월 일정",
                    startDate = LocalDate.of(2026, 2, 14),
                    category = ScheduleCategory.APPOINTMENT,
                ),
            )
            scheduleRepository.save(
                Schedule(
                    group = testGroup,
                    user = testUser,
                    title = "3월 일정",
                    startDate = LocalDate.of(2026, 3, 1),
                    category = ScheduleCategory.WORK,
                ),
            )

            // when & then
            mockMvc.get(baseUrl()) {
                header("Authorization", "Bearer $testToken")
                param("startDate", "2026-02-01")
                param("endDate", "2026-02-28")
            }.andExpect {
                status { isOk() }
                jsonPath("$.length()") { value(1) }
                jsonPath("$[0].title") { value("2월 일정") }
            }
        }

        @Test
        fun `should return multi-day schedule that overlaps date range`() {
            // given
            scheduleRepository.save(
                Schedule(
                    group = testGroup,
                    user = testUser,
                    title = "장기 출장",
                    startDate = LocalDate.of(2026, 1, 28),
                    endDate = LocalDate.of(2026, 2, 5),
                ),
            )

            // when & then
            mockMvc.get(baseUrl()) {
                header("Authorization", "Bearer $testToken")
                param("startDate", "2026-02-01")
                param("endDate", "2026-02-28")
            }.andExpect {
                status { isOk() }
                jsonPath("$.length()") { value(1) }
                jsonPath("$[0].title") { value("장기 출장") }
            }
        }
    }

    @Nested
    inner class GetSchedule {

        @Test
        fun `should return single schedule by id`() {
            // given
            val schedule = scheduleRepository.save(
                Schedule(
                    group = testGroup,
                    user = testUser,
                    title = "상세 조회 테스트",
                    startDate = LocalDate.of(2026, 2, 14),
                    memo = "메모 내용",
                ),
            )

            // when & then
            mockMvc.get("${baseUrl()}/${schedule.id}") {
                header("Authorization", "Bearer $testToken")
            }.andExpect {
                status { isOk() }
                jsonPath("$.title") { value("상세 조회 테스트") }
                jsonPath("$.memo") { value("메모 내용") }
            }
        }

        @Test
        fun `should return 404 for non-existent schedule`() {
            // when & then
            mockMvc.get("${baseUrl()}/99999") {
                header("Authorization", "Bearer $testToken")
            }.andExpect {
                status { isNotFound() }
                jsonPath("$.code") { value("SCHEDULE_NOT_FOUND") }
            }
        }
    }

    @Nested
    inner class UpdateSchedule {

        @Test
        fun `should return 200 when updating schedule`() {
            // given
            val schedule = scheduleRepository.save(
                Schedule(
                    group = testGroup,
                    user = testUser,
                    title = "원래 제목",
                    startDate = LocalDate.of(2026, 2, 14),
                    assetType = AssetType.PERSONAL,
                ),
            )

            val request = UpdateScheduleRequest(
                title = "수정된 제목",
                startDate = LocalDate.of(2026, 2, 15),
                isAllDay = true,
                assetType = AssetType.JOINT,
                category = ScheduleCategory.ANNIVERSARY,
                memo = "수정 메모",
            )

            // when & then
            mockMvc.put("${baseUrl()}/${schedule.id}") {
                header("Authorization", "Bearer $testToken")
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(request)
            }.andExpect {
                status { isOk() }
                jsonPath("$.title") { value("수정된 제목") }
                jsonPath("$.start_date") { value("2026-02-15") }
                jsonPath("$.asset_type") { value("JOINT") }
                jsonPath("$.category") { value("ANNIVERSARY") }
                jsonPath("$.memo") { value("수정 메모") }
            }
        }

        @Test
        fun `should return 404 when updating non-existent schedule`() {
            // given
            val request = UpdateScheduleRequest(
                title = "수정",
                startDate = LocalDate.of(2026, 2, 14),
            )

            // when & then
            mockMvc.put("${baseUrl()}/99999") {
                header("Authorization", "Bearer $testToken")
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(request)
            }.andExpect {
                status { isNotFound() }
            }
        }
    }

    @Nested
    inner class DeleteSchedule {

        @Test
        fun `should return 204 when deleting schedule`() {
            // given
            val schedule = scheduleRepository.save(
                Schedule(
                    group = testGroup,
                    user = testUser,
                    title = "삭제할 일정",
                    startDate = LocalDate.of(2026, 2, 14),
                ),
            )

            // when & then
            mockMvc.delete("${baseUrl()}/${schedule.id}") {
                header("Authorization", "Bearer $testToken")
            }.andExpect {
                status { isNoContent() }
            }
        }

        @Test
        fun `should return 404 when deleting non-existent schedule`() {
            // when & then
            mockMvc.delete("${baseUrl()}/99999") {
                header("Authorization", "Bearer $testToken")
            }.andExpect {
                status { isNotFound() }
            }
        }
    }
}
