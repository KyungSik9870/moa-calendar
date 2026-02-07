package com.moa.core.domain.category

import com.moa.core.domain.BaseEntity
import com.moa.core.domain.group.Group
import jakarta.persistence.*

@Entity
@Table(
    name = "categories",
    indexes = [Index(name = "idx_category_group", columnList = "group_id")],
)
class Category(

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    val group: Group,

    @Column(nullable = false, length = 30)
    var name: String,

    @Column(length = 10)
    var icon: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    val type: CategoryType,

    @Column(name = "is_default", nullable = false)
    val isDefault: Boolean = false,

    @Column(name = "sort_order", nullable = false)
    var sortOrder: Int = 0,

) : BaseEntity() {

    init {
        require(name.isNotBlank()) { "카테고리 이름은 필수입니다." }
        require(name.length <= 30) { "카테고리 이름은 30자 이하여야 합니다." }
    }

    fun update(name: String, icon: String?) {
        require(name.isNotBlank()) { "카테고리 이름은 필수입니다." }
        require(name.length <= 30) { "카테고리 이름은 30자 이하여야 합니다." }
        this.name = name
        this.icon = icon
    }
}
