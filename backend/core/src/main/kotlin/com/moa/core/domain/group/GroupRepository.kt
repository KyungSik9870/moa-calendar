package com.moa.core.domain.group

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface GroupRepository : JpaRepository<Group, Long> {

    @Query(
        """
        SELECT g FROM Group g
        JOIN GroupMember gm ON gm.group = g
        WHERE gm.user.id = :userId
        AND gm.status = 'ACCEPTED'
        ORDER BY g.createdAt ASC
        """,
    )
    fun findByUserId(userId: Long): List<Group>
}
