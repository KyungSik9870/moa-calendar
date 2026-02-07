package com.moa.core.domain.assetsource

import com.moa.core.domain.group.GroupMemberRepository
import com.moa.core.domain.group.GroupMemberStatus
import com.moa.core.domain.group.GroupRepository
import com.moa.core.exception.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class AssetSourceService(
    private val assetSourceRepository: AssetSourceRepository,
    private val groupRepository: GroupRepository,
    private val groupMemberRepository: GroupMemberRepository,
) {

    @Transactional
    fun create(groupId: Long, userId: Long, name: String, type: AssetSourceType, description: String?): AssetSource {
        val group = groupRepository.findById(groupId).orElseThrow { GroupNotFoundException(groupId) }
        verifyGroupAccess(groupId, userId)

        return assetSourceRepository.save(
            AssetSource(
                group = group,
                name = name,
                type = type,
                description = description,
            ),
        )
    }

    fun findByGroupId(groupId: Long, userId: Long): List<AssetSource> {
        verifyGroupAccess(groupId, userId)
        return assetSourceRepository.findByGroupId(groupId)
    }

    fun findById(assetSourceId: Long, userId: Long): AssetSource {
        val assetSource = assetSourceRepository.findById(assetSourceId)
            .orElseThrow { AssetSourceNotFoundException(assetSourceId) }
        verifyGroupAccess(assetSource.group.id, userId)
        return assetSource
    }

    @Transactional
    fun update(assetSourceId: Long, userId: Long, name: String, description: String?): AssetSource {
        val assetSource = assetSourceRepository.findById(assetSourceId)
            .orElseThrow { AssetSourceNotFoundException(assetSourceId) }
        verifyGroupAccess(assetSource.group.id, userId)
        assetSource.update(name, description)
        return assetSource
    }

    @Transactional
    fun delete(assetSourceId: Long, userId: Long) {
        val assetSource = assetSourceRepository.findById(assetSourceId)
            .orElseThrow { AssetSourceNotFoundException(assetSourceId) }
        verifyGroupAccess(assetSource.group.id, userId)
        assetSourceRepository.delete(assetSource)
    }

    private fun verifyGroupAccess(groupId: Long, userId: Long) {
        if (!groupMemberRepository.existsByGroupIdAndUserIdAndStatus(groupId, userId, GroupMemberStatus.ACCEPTED)) {
            throw GroupAccessDeniedException(groupId)
        }
    }
}
