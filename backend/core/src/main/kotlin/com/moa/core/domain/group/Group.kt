package com.moa.core.domain.group

import com.moa.core.domain.BaseEntity
import com.moa.core.domain.user.User
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table

@Entity
@Table(name = "calendar_groups")
class Group(

    @Column(nullable = false, length = 30)
    var name: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    val type: GroupType,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    val host: User,

    @Column(name = "joint_asset_color", nullable = false, length = 7)
    var jointAssetColor: String = DEFAULT_JOINT_ASSET_COLOR,

    @Column(name = "budget_start_day", nullable = false)
    var budgetStartDay: Int = DEFAULT_BUDGET_START_DAY,

) : BaseEntity() {

    companion object {
        const val DEFAULT_JOINT_ASSET_COLOR = "#2196F3"
        const val DEFAULT_BUDGET_START_DAY = 1
        const val MAX_MEMBERS = 10
    }

    init {
        require(name.isNotBlank()) { "캘린더 이름은 필수입니다." }
        require(name.length <= 30) { "캘린더 이름은 30자 이하여야 합니다." }
        require(budgetStartDay in 1..28) { "가계부 시작일은 1~28 사이여야 합니다." }
    }
}
