package com.moa.api.dto.response

import com.moa.core.domain.assetsource.AssetSource
import com.moa.core.domain.assetsource.AssetSourceType
import java.time.LocalDateTime

data class AssetSourceResponse(
    val id: Long,
    val groupId: Long,
    val name: String,
    val type: AssetSourceType,
    val description: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
) {

    companion object {
        fun from(assetSource: AssetSource): AssetSourceResponse = AssetSourceResponse(
            id = assetSource.id,
            groupId = assetSource.group.id,
            name = assetSource.name,
            type = assetSource.type,
            description = assetSource.description,
            createdAt = assetSource.createdAt,
            updatedAt = assetSource.updatedAt,
        )
    }
}
