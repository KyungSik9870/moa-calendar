package com.moa.core.domain.group

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface GroupMemberRepository : JpaRepository<GroupMember, Long> {

    fun existsByGroupIdAndUserIdAndStatus(
        groupId: Long,
        userId: Long,
        status: GroupMemberStatus,
    ): Boolean

    fun countByGroupIdAndStatus(groupId: Long, status: GroupMemberStatus): Long

    @Query(
        """
        SELECT gm FROM GroupMember gm
        JOIN FETCH gm.user
        WHERE gm.group.id = :groupId
        ORDER BY gm.role ASC, gm.joinedAt ASC
        """,
    )
    fun findByGroupIdWithUser(groupId: Long): List<GroupMember>

    fun findByGroupIdAndUserId(groupId: Long, userId: Long): GroupMember?

    fun deleteByGroupId(groupId: Long)
}
