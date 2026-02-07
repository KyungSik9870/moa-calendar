package com.moa.core.domain.invite

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface InviteRepository : JpaRepository<Invite, Long> {

    fun existsByGroupIdAndInviteeIdAndStatus(groupId: Long, inviteeId: Long, status: InviteStatus): Boolean

    @Query(
        """
        SELECT i FROM Invite i
        JOIN FETCH i.group g
        JOIN FETCH i.inviter
        WHERE i.invitee.id = :inviteeId
        AND i.status = :status
        ORDER BY i.createdAt DESC
        """,
    )
    fun findByInviteeIdAndStatus(inviteeId: Long, status: InviteStatus): List<Invite>

    fun deleteByGroupId(groupId: Long)
}
