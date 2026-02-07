package com.moa.api.dto.response

import com.moa.core.domain.category.Category
import com.moa.core.domain.category.CategoryType
import java.time.LocalDateTime

data class CategoryResponse(
    val id: Long,
    val groupId: Long,
    val name: String,
    val icon: String?,
    val type: CategoryType,
    val isDefault: Boolean,
    val sortOrder: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
) {

    companion object {
        fun from(category: Category): CategoryResponse = CategoryResponse(
            id = category.id,
            groupId = category.group.id,
            name = category.name,
            icon = category.icon,
            type = category.type,
            isDefault = category.isDefault,
            sortOrder = category.sortOrder,
            createdAt = category.createdAt,
            updatedAt = category.updatedAt,
        )
    }
}
