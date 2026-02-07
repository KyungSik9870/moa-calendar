package com.moa.api.dto.response

import com.moa.core.domain.group.Group
import com.moa.core.domain.group.GroupType
import java.time.LocalDateTime

data class GroupResponse(
    val id: Long,
    val name: String,
    val type: GroupType,
    val hostId: Long,
    val jointAssetColor: String,
    val budgetStartDay: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
) {

    companion object {
        fun from(group: Group): GroupResponse = GroupResponse(
            id = group.id,
            name = group.name,
            type = group.type,
            hostId = group.host.id,
            jointAssetColor = group.jointAssetColor,
            budgetStartDay = group.budgetStartDay,
            createdAt = group.createdAt,
            updatedAt = group.updatedAt,
        )
    }
}
