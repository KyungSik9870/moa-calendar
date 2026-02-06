package com.moa.core.domain.schedule

import com.moa.core.domain.AssetType
import com.moa.core.domain.group.Group
import com.moa.core.domain.group.GroupMemberRepository
import com.moa.core.domain.group.GroupMemberStatus
import com.moa.core.domain.group.GroupRepository
import com.moa.core.domain.group.GroupType
import com.moa.core.domain.user.User
import com.moa.core.exception.GroupAccessDeniedException
import com.moa.core.exception.GroupNotFoundException
import com.moa.core.exception.ScheduleNotFoundException
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.time.LocalTime
import java.util.Optional

class ScheduleServiceTest {

    private val scheduleRepository: ScheduleRepository = mockk(relaxed = true)
    private val groupRepository: GroupRepository = mockk()
    private val groupMemberRepository: GroupMemberRepository = mockk()

    private lateinit var scheduleService: ScheduleService
    private lateinit var testUser: User
    private lateinit var testGroup: Group

    @BeforeEach
    fun setUp() {
        scheduleService = ScheduleService(scheduleRepository, groupRepository, groupMemberRepository)

        testUser = mockk<User> {
            every { id } returns 1L
            every { nickname } returns "민수"
            every { colorCode } returns "#5B9FFF"
            every { email } returns "minsu@email.com"
        }

        testGroup = mockk<Group> {
            every { id } returns 10L
            every { name } returns "민수의 하루"
            every { type } returns GroupType.PERSONAL
        }
    }

    private fun stubGroupAccess(groupId: Long = 10L, userId: Long = 1L, allowed: Boolean = true) {
        every { groupRepository.findById(groupId) } returns Optional.of(testGroup)
        every {
            groupMemberRepository.existsByGroupIdAndUserIdAndStatus(groupId, userId, GroupMemberStatus.ACCEPTED)
        } returns allowed
    }

    @Nested
    inner class Create {

        @Test
        fun `should create a single all-day schedule`() {
            // given
            stubGroupAccess()
            val saved = slot<Schedule>()
            every { scheduleRepository.save(capture(saved)) } answers { saved.captured }

            // when
            val result = scheduleService.create(
                groupId = 10L,
                user = testUser,
                title = "치과 예약",
                startDate = LocalDate.of(2026, 2, 14),
                endDate = null,
                startTime = null,
                endTime = null,
                isAllDay = true,
                assetType = AssetType.PERSONAL,
                category = ScheduleCategory.HOSPITAL,
                memo = "3시 예약",
                repeatType = RepeatType.NONE,
                repeatEndDate = null,
            )

            // then
            result.title shouldBe "치과 예약"
            result.isAllDay shouldBe true
            result.assetType shouldBe AssetType.PERSONAL
            result.category shouldBe ScheduleCategory.HOSPITAL
            result.repeatType shouldBe RepeatType.NONE
            result.repeatGroupId shouldBe null
        }

        @Test
        fun `should create a time-specific schedule`() {
            // given
            stubGroupAccess()
            val saved = slot<Schedule>()
            every { scheduleRepository.save(capture(saved)) } answers { saved.captured }

            // when
            val result = scheduleService.create(
                groupId = 10L,
                user = testUser,
                title = "저녁 약속",
                startDate = LocalDate.of(2026, 2, 14),
                endDate = null,
                startTime = LocalTime.of(19, 0),
                endTime = LocalTime.of(21, 0),
                isAllDay = false,
                assetType = AssetType.PERSONAL,
                category = ScheduleCategory.APPOINTMENT,
                memo = null,
                repeatType = RepeatType.NONE,
                repeatEndDate = null,
            )

            // then
            result.isAllDay shouldBe false
            result.startTime shouldBe LocalTime.of(19, 0)
            result.endTime shouldBe LocalTime.of(21, 0)
        }

        @Test
        fun `should create weekly repeat instances`() {
            // given
            stubGroupAccess()
            val savedSchedules = mutableListOf<Schedule>()
            every { scheduleRepository.save(any()) } answers {
                val schedule = firstArg<Schedule>()
                savedSchedules.add(schedule)
                schedule
            }
            every { scheduleRepository.saveAll(any<List<Schedule>>()) } answers {
                val list = firstArg<List<Schedule>>()
                savedSchedules.addAll(list)
                list
            }

            // when
            scheduleService.create(
                groupId = 10L,
                user = testUser,
                title = "주간 회의",
                startDate = LocalDate.of(2026, 2, 1),
                endDate = null,
                startTime = LocalTime.of(10, 0),
                endTime = LocalTime.of(11, 0),
                isAllDay = false,
                assetType = AssetType.JOINT,
                category = ScheduleCategory.WORK,
                memo = null,
                repeatType = RepeatType.WEEKLY,
                repeatEndDate = LocalDate.of(2026, 3, 1),
            )

            // then
            verify { scheduleRepository.saveAll(any<List<Schedule>>()) }
        }

        @Test
        fun `should throw GroupNotFoundException when group does not exist`() {
            // given
            every { groupRepository.findById(999L) } returns Optional.empty()

            // when & then
            shouldThrow<GroupNotFoundException> {
                scheduleService.create(
                    groupId = 999L,
                    user = testUser,
                    title = "테스트",
                    startDate = LocalDate.now(),
                    endDate = null,
                    startTime = null,
                    endTime = null,
                    isAllDay = true,
                    assetType = AssetType.PERSONAL,
                    category = ScheduleCategory.ETC,
                    memo = null,
                    repeatType = RepeatType.NONE,
                    repeatEndDate = null,
                )
            }
        }

        @Test
        fun `should throw GroupAccessDeniedException when user is not a member`() {
            // given
            stubGroupAccess(allowed = false)

            // when & then
            shouldThrow<GroupAccessDeniedException> {
                scheduleService.create(
                    groupId = 10L,
                    user = testUser,
                    title = "테스트",
                    startDate = LocalDate.now(),
                    endDate = null,
                    startTime = null,
                    endTime = null,
                    isAllDay = true,
                    assetType = AssetType.PERSONAL,
                    category = ScheduleCategory.ETC,
                    memo = null,
                    repeatType = RepeatType.NONE,
                    repeatEndDate = null,
                )
            }
        }
    }

    @Nested
    inner class FindByDateRange {

        @Test
        fun `should return schedules within date range`() {
            // given
            val startDate = LocalDate.of(2026, 2, 1)
            val endDate = LocalDate.of(2026, 2, 28)
            val schedule = mockk<Schedule>()

            every {
                groupMemberRepository.existsByGroupIdAndUserIdAndStatus(10L, 1L, GroupMemberStatus.ACCEPTED)
            } returns true
            every { scheduleRepository.findByGroupIdAndDateRange(10L, startDate, endDate) } returns listOf(schedule)

            // when
            val result = scheduleService.findByDateRange(10L, 1L, startDate, endDate)

            // then
            result shouldHaveSize 1
        }

        @Test
        fun `should throw GroupAccessDeniedException for non-member`() {
            // given
            every {
                groupMemberRepository.existsByGroupIdAndUserIdAndStatus(10L, 1L, GroupMemberStatus.ACCEPTED)
            } returns false

            // when & then
            shouldThrow<GroupAccessDeniedException> {
                scheduleService.findByDateRange(10L, 1L, LocalDate.now(), LocalDate.now())
            }
        }
    }

    @Nested
    inner class Update {

        @Test
        fun `should update schedule fields`() {
            // given
            val schedule = Schedule(
                group = testGroup,
                user = testUser,
                title = "원래 제목",
                startDate = LocalDate.of(2026, 2, 14),
                isAllDay = true,
                assetType = AssetType.PERSONAL,
                category = ScheduleCategory.ETC,
            )

            every { scheduleRepository.findById(1L) } returns Optional.of(schedule)
            every {
                groupMemberRepository.existsByGroupIdAndUserIdAndStatus(10L, 1L, GroupMemberStatus.ACCEPTED)
            } returns true

            // when
            val result = scheduleService.update(
                scheduleId = 1L,
                userId = 1L,
                title = "수정된 제목",
                startDate = LocalDate.of(2026, 2, 15),
                endDate = null,
                startTime = null,
                endTime = null,
                isAllDay = true,
                assetType = AssetType.JOINT,
                category = ScheduleCategory.APPOINTMENT,
                memo = "메모 추가",
            )

            // then
            result.title shouldBe "수정된 제목"
            result.startDate shouldBe LocalDate.of(2026, 2, 15)
            result.assetType shouldBe AssetType.JOINT
            result.category shouldBe ScheduleCategory.APPOINTMENT
            result.memo shouldBe "메모 추가"
        }

        @Test
        fun `should throw ScheduleNotFoundException when schedule does not exist`() {
            // given
            every { scheduleRepository.findById(999L) } returns Optional.empty()

            // when & then
            shouldThrow<ScheduleNotFoundException> {
                scheduleService.update(
                    scheduleId = 999L,
                    userId = 1L,
                    title = "테스트",
                    startDate = LocalDate.now(),
                    endDate = null,
                    startTime = null,
                    endTime = null,
                    isAllDay = true,
                    assetType = AssetType.PERSONAL,
                    category = ScheduleCategory.ETC,
                    memo = null,
                )
            }
        }
    }

    @Nested
    inner class Delete {

        @Test
        fun `should delete schedule`() {
            // given
            val schedule = Schedule(
                group = testGroup,
                user = testUser,
                title = "삭제할 일정",
                startDate = LocalDate.now(),
            )

            every { scheduleRepository.findById(1L) } returns Optional.of(schedule)
            every {
                groupMemberRepository.existsByGroupIdAndUserIdAndStatus(10L, 1L, GroupMemberStatus.ACCEPTED)
            } returns true

            // when
            scheduleService.delete(1L, 1L)

            // then
            verify { scheduleRepository.delete(schedule) }
        }

        @Test
        fun `should throw ScheduleNotFoundException when deleting non-existent schedule`() {
            // given
            every { scheduleRepository.findById(999L) } returns Optional.empty()

            // when & then
            shouldThrow<ScheduleNotFoundException> {
                scheduleService.delete(999L, 1L)
            }
        }
    }

    @Nested
    inner class DeleteRepeatGroup {

        @Test
        fun `should delete all schedules in repeat group`() {
            // given
            val schedule = Schedule(
                group = testGroup,
                user = testUser,
                title = "반복 일정",
                startDate = LocalDate.now(),
                repeatType = RepeatType.WEEKLY,
                repeatGroupId = 5L,
            )

            every { scheduleRepository.findByRepeatGroupId(5L) } returns listOf(schedule)
            every {
                groupMemberRepository.existsByGroupIdAndUserIdAndStatus(10L, 1L, GroupMemberStatus.ACCEPTED)
            } returns true

            // when
            scheduleService.deleteRepeatGroup(5L, 1L)

            // then
            verify { scheduleRepository.deleteByRepeatGroupId(5L) }
        }

        @Test
        fun `should throw ScheduleNotFoundException when repeat group is empty`() {
            // given
            every { scheduleRepository.findByRepeatGroupId(999L) } returns emptyList()

            // when & then
            shouldThrow<ScheduleNotFoundException> {
                scheduleService.deleteRepeatGroup(999L, 1L)
            }
        }
    }
}
