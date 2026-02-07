package com.moa.core.domain.category

import org.springframework.data.jpa.repository.JpaRepository

interface CategoryRepository : JpaRepository<Category, Long> {

    fun findByGroupIdOrderBySortOrder(groupId: Long): List<Category>

    fun findByGroupIdAndTypeOrderBySortOrder(groupId: Long, type: CategoryType): List<Category>

    fun countByGroupId(groupId: Long): Int
}
