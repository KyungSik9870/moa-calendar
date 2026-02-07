package com.moa.core.domain.assetsource

import com.moa.core.domain.BaseEntity
import com.moa.core.domain.group.Group
import jakarta.persistence.*

@Entity
@Table(name = "asset_sources")
class AssetSource(

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    val group: Group,

    @Column(nullable = false, length = 30)
    var name: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    val type: AssetSourceType,

    @Column(length = 100)
    var description: String? = null,

) : BaseEntity() {

    init {
        require(name.isNotBlank()) { "자산 이름은 필수입니다." }
        require(name.length <= 30) { "자산 이름은 30자 이하여야 합니다." }
    }

    fun update(name: String, description: String?) {
        require(name.isNotBlank()) { "자산 이름은 필수입니다." }
        require(name.length <= 30) { "자산 이름은 30자 이하여야 합니다." }
        this.name = name
        this.description = description
    }
}
