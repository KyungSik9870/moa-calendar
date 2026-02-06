package com.moa.core.domain.group

import com.moa.core.domain.user.User
import com.moa.core.exception.GroupNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class GroupService(
    private val groupRepository: GroupRepository,
    private val groupMemberRepository: GroupMemberRepository,
) {

    @Transactional
    fun createPersonalGroup(user: User, calendarName: String): Group {
        val group = groupRepository.save(
            Group(
                name = calendarName,
                type = GroupType.PERSONAL,
                host = user,
            ),
        )

        groupMemberRepository.save(
            GroupMember(
                group = group,
                user = user,
                role = GroupRole.HOST,
                status = GroupMemberStatus.ACCEPTED,
                joinedAt = LocalDateTime.now(),
            ),
        )

        return group
    }

    fun findById(groupId: Long): Group =
        groupRepository.findById(groupId).orElseThrow { GroupNotFoundException(groupId) }

    fun isAcceptedMember(groupId: Long, userId: Long): Boolean =
        groupMemberRepository.existsByGroupIdAndUserIdAndStatus(
            groupId,
            userId,
            GroupMemberStatus.ACCEPTED,
        )
}
