package com.moa.api.dto.response

import com.moa.core.domain.group.GroupMember
import com.moa.core.domain.group.GroupMemberStatus
import com.moa.core.domain.group.GroupRole
import java.time.LocalDateTime

data class GroupMemberResponse(
    val id: Long,
    val userId: Long,
    val nickname: String,
    val colorCode: String,
    val role: GroupRole,
    val status: GroupMemberStatus,
    val joinedAt: LocalDateTime?,
) {

    companion object {
        fun from(member: GroupMember): GroupMemberResponse = GroupMemberResponse(
            id = member.id,
            userId = member.user.id,
            nickname = member.user.nickname,
            colorCode = member.user.colorCode,
            role = member.role,
            status = member.status,
            joinedAt = member.joinedAt,
        )
    }
}
