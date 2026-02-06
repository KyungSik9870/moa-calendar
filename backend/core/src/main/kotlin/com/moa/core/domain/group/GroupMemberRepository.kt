package com.moa.core.domain.group

import org.springframework.data.jpa.repository.JpaRepository

interface GroupMemberRepository : JpaRepository<GroupMember, Long> {

    fun existsByGroupIdAndUserIdAndStatus(
        groupId: Long,
        userId: Long,
        status: GroupMemberStatus,
    ): Boolean

    fun countByGroupIdAndStatus(groupId: Long, status: GroupMemberStatus): Long
}
