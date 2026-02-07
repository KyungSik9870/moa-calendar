package com.moa.core.domain.category

import com.moa.core.domain.group.GroupMemberRepository
import com.moa.core.domain.group.GroupMemberStatus
import com.moa.core.domain.group.GroupRepository
import com.moa.core.exception.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class CategoryService(
    private val categoryRepository: CategoryRepository,
    private val groupRepository: GroupRepository,
    private val groupMemberRepository: GroupMemberRepository,
) {

    @Transactional
    fun create(groupId: Long, userId: Long, name: String, icon: String?, type: CategoryType): Category {
        val group = groupRepository.findById(groupId).orElseThrow { GroupNotFoundException(groupId) }
        verifyGroupAccess(groupId, userId)

        val sortOrder = categoryRepository.countByGroupId(groupId)

        return categoryRepository.save(
            Category(
                group = group,
                name = name,
                icon = icon,
                type = type,
                sortOrder = sortOrder,
            ),
        )
    }

    fun findByGroupId(groupId: Long, userId: Long, type: CategoryType?): List<Category> {
        verifyGroupAccess(groupId, userId)
        return if (type != null) {
            categoryRepository.findByGroupIdAndTypeOrderBySortOrder(groupId, type)
        } else {
            categoryRepository.findByGroupIdOrderBySortOrder(groupId)
        }
    }

    @Transactional
    fun update(categoryId: Long, userId: Long, name: String, icon: String?): Category {
        val category = categoryRepository.findById(categoryId)
            .orElseThrow { CategoryNotFoundException(categoryId) }
        verifyGroupAccess(category.group.id, userId)
        category.update(name, icon)
        return category
    }

    @Transactional
    fun delete(categoryId: Long, userId: Long) {
        val category = categoryRepository.findById(categoryId)
            .orElseThrow { CategoryNotFoundException(categoryId) }
        verifyGroupAccess(category.group.id, userId)

        if (category.isDefault) throw DefaultCategoryUndeletableException()

        categoryRepository.delete(category)
    }

    @Transactional
    fun createDefaultCategories(groupId: Long) {
        val group = groupRepository.findById(groupId).orElseThrow { GroupNotFoundException(groupId) }

        val defaults = listOf(
            Triple("식비", "🍚", CategoryType.EXPENSE),
            Triple("교통", "🚌", CategoryType.EXPENSE),
            Triple("쇼핑", "🛍️", CategoryType.EXPENSE),
            Triple("의료", "🏥", CategoryType.EXPENSE),
            Triple("문화", "🎬", CategoryType.EXPENSE),
            Triple("기타", "📦", CategoryType.EXPENSE),
            Triple("급여", "💰", CategoryType.INCOME),
            Triple("용돈", "💵", CategoryType.INCOME),
            Triple("기타", "📦", CategoryType.INCOME),
        )

        defaults.forEachIndexed { index, (name, icon, type) ->
            categoryRepository.save(
                Category(
                    group = group,
                    name = name,
                    icon = icon,
                    type = type,
                    isDefault = true,
                    sortOrder = index,
                ),
            )
        }
    }

    private fun verifyGroupAccess(groupId: Long, userId: Long) {
        if (!groupMemberRepository.existsByGroupIdAndUserIdAndStatus(groupId, userId, GroupMemberStatus.ACCEPTED)) {
            throw GroupAccessDeniedException(groupId)
        }
    }
}
