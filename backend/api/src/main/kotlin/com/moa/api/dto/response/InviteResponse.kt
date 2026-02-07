package com.moa.api.dto.response

import com.moa.core.domain.invite.Invite
import com.moa.core.domain.invite.InviteStatus
import java.time.LocalDateTime

data class InviteResponse(
    val id: Long,
    val groupId: Long,
    val groupName: String,
    val inviterNickname: String,
    val inviteeEmail: String,
    val status: InviteStatus,
    val createdAt: LocalDateTime,
) {

    companion object {
        fun from(invite: Invite): InviteResponse = InviteResponse(
            id = invite.id,
            groupId = invite.group.id,
            groupName = invite.group.name,
            inviterNickname = invite.inviter.nickname,
            inviteeEmail = invite.invitee.email,
            status = invite.status,
            createdAt = invite.createdAt,
        )
    }
}
