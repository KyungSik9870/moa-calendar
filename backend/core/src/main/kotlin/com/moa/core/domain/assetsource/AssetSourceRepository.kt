package com.moa.core.domain.assetsource

import org.springframework.data.jpa.repository.JpaRepository

interface AssetSourceRepository : JpaRepository<AssetSource, Long> {

    fun findByGroupId(groupId: Long): List<AssetSource>
}
