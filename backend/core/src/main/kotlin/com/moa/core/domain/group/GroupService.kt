package com.moa.core.domain.group

import com.moa.core.domain.category.CategoryService
import com.moa.core.domain.invite.InviteRepository
import com.moa.core.domain.user.User
import com.moa.core.exception.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class GroupService(
    private val groupRepository: GroupRepository,
    private val groupMemberRepository: GroupMemberRepository,
    private val inviteRepository: InviteRepository,
    private val categoryService: CategoryService,
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

        categoryService.createDefaultCategories(group.id)

        return group
    }

    @Transactional
    fun createSharedGroup(user: User, name: String, jointAssetColor: String?, budgetStartDay: Int?): Group {
        val group = groupRepository.save(
            Group(
                name = name,
                type = GroupType.SHARED,
                host = user,
                jointAssetColor = jointAssetColor ?: Group.DEFAULT_JOINT_ASSET_COLOR,
                budgetStartDay = budgetStartDay ?: Group.DEFAULT_BUDGET_START_DAY,
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

        categoryService.createDefaultCategories(group.id)

        return group
    }

    fun findById(groupId: Long): Group =
        groupRepository.findById(groupId).orElseThrow { GroupNotFoundException(groupId) }

    fun findByUserId(userId: Long): List<Group> =
        groupRepository.findByUserId(userId)

    fun isAcceptedMember(groupId: Long, userId: Long): Boolean =
        groupMemberRepository.existsByGroupIdAndUserIdAndStatus(
            groupId,
            userId,
            GroupMemberStatus.ACCEPTED,
        )

    fun getMembers(groupId: Long, userId: Long): List<GroupMember> {
        verifyGroupAccess(groupId, userId)
        return groupMemberRepository.findByGroupIdWithUser(groupId)
    }

    @Transactional
    fun updateGroup(groupId: Long, userId: Long, name: String?, jointAssetColor: String?, budgetStartDay: Int?): Group {
        val group = findById(groupId)
        if (group.host.id != userId) throw NotGroupHostException(groupId)

        name?.let { group.name = it }
        jointAssetColor?.let { group.jointAssetColor = it }
        budgetStartDay?.let { group.budgetStartDay = it }

        return group
    }

    @Transactional
    fun deleteGroup(groupId: Long, userId: Long) {
        val group = findById(groupId)
        if (group.type == GroupType.PERSONAL) throw CannotDeletePersonalGroupException()
        if (group.host.id != userId) throw NotGroupHostException(groupId)

        inviteRepository.deleteByGroupId(groupId)
        groupMemberRepository.deleteByGroupId(groupId)
        groupRepository.delete(group)
    }

    @Transactional
    fun removeMember(groupId: Long, hostUserId: Long, targetUserId: Long) {
        val group = findById(groupId)
        if (group.host.id != hostUserId) throw NotGroupHostException(groupId)

        val member = groupMemberRepository.findByGroupIdAndUserId(groupId, targetUserId)
            ?: throw UserNotFoundException(targetUserId.toString())

        groupMemberRepository.delete(member)
    }

    @Transactional
    fun leaveGroup(groupId: Long, userId: Long) {
        val group = findById(groupId)
        if (group.host.id == userId) throw CannotLeaveAsHostException(groupId)

        val member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
            ?: throw GroupAccessDeniedException(groupId)

        groupMemberRepository.delete(member)
    }

    private fun verifyGroupAccess(groupId: Long, userId: Long) {
        if (!groupMemberRepository.existsByGroupIdAndUserIdAndStatus(groupId, userId, GroupMemberStatus.ACCEPTED)) {
            throw GroupAccessDeniedException(groupId)
        }
    }
}
