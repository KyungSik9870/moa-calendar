package com.moa.core.domain.invite

import com.moa.core.domain.group.*
import com.moa.core.domain.user.User
import com.moa.core.domain.user.UserRepository
import com.moa.core.exception.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class InviteService(
    private val inviteRepository: InviteRepository,
    private val groupRepository: GroupRepository,
    private val groupMemberRepository: GroupMemberRepository,
    private val userRepository: UserRepository,
) {

    @Transactional
    fun invite(groupId: Long, inviter: User, inviteeEmail: String): Invite {
        val group = groupRepository.findById(groupId).orElseThrow { GroupNotFoundException(groupId) }

        if (group.host.id != inviter.id) {
            throw NotGroupHostException(groupId)
        }

        val invitee = userRepository.findByEmail(inviteeEmail)
            ?: throw UserNotFoundException(inviteeEmail)

        if (inviter.id == invitee.id) {
            throw SelfInviteException()
        }

        if (groupMemberRepository.existsByGroupIdAndUserIdAndStatus(groupId, invitee.id, GroupMemberStatus.ACCEPTED)) {
            throw AlreadyGroupMemberException(inviteeEmail)
        }

        if (inviteRepository.existsByGroupIdAndInviteeIdAndStatus(groupId, invitee.id, InviteStatus.PENDING)) {
            throw InviteAlreadyExistsException(inviteeEmail)
        }

        val memberCount = groupMemberRepository.countByGroupIdAndStatus(groupId, GroupMemberStatus.ACCEPTED)
        if (memberCount >= Group.MAX_MEMBERS) {
            throw GroupFullException(groupId)
        }

        return inviteRepository.save(
            Invite(
                group = group,
                inviter = inviter,
                invitee = invitee,
            ),
        )
    }

    fun findPendingByUserId(userId: Long): List<Invite> =
        inviteRepository.findByInviteeIdAndStatus(userId, InviteStatus.PENDING)

    @Transactional
    fun accept(inviteId: Long, userId: Long): GroupMember {
        val invite = inviteRepository.findById(inviteId)
            .orElseThrow { InviteNotFoundException(inviteId) }

        require(invite.invitee.id == userId) { "해당 초대에 대한 권한이 없습니다." }

        val memberCount = groupMemberRepository.countByGroupIdAndStatus(invite.group.id, GroupMemberStatus.ACCEPTED)
        if (memberCount >= Group.MAX_MEMBERS) {
            throw GroupFullException(invite.group.id)
        }

        invite.accept()

        val groupMember = groupMemberRepository.save(
            GroupMember(
                group = invite.group,
                user = invite.invitee,
                role = GroupRole.GUEST,
                status = GroupMemberStatus.ACCEPTED,
                joinedAt = LocalDateTime.now(),
            ),
        )

        return groupMember
    }

    @Transactional
    fun reject(inviteId: Long, userId: Long) {
        val invite = inviteRepository.findById(inviteId)
            .orElseThrow { InviteNotFoundException(inviteId) }

        require(invite.invitee.id == userId) { "해당 초대에 대한 권한이 없습니다." }

        invite.reject()
    }
}
