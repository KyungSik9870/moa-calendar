package com.moa.api.controller

import com.moa.api.dto.request.CreateAssetSourceRequest
import com.moa.api.dto.request.UpdateAssetSourceRequest
import com.moa.api.dto.response.AssetSourceResponse
import com.moa.api.security.UserPrincipal
import com.moa.core.domain.assetsource.AssetSourceService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/groups/{groupId}/asset-sources")
class AssetSourceController(
    private val assetSourceService: AssetSourceService,
) {

    @PostMapping
    fun createAssetSource(
        @PathVariable groupId: Long,
        @Valid @RequestBody request: CreateAssetSourceRequest,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<AssetSourceResponse> {
        val assetSource = assetSourceService.create(
            groupId = groupId,
            userId = principal.userId,
            name = request.name,
            type = request.type,
            description = request.description,
        )

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(AssetSourceResponse.from(assetSource))
    }

    @GetMapping
    fun getAssetSources(
        @PathVariable groupId: Long,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<List<AssetSourceResponse>> {
        val assetSources = assetSourceService.findByGroupId(groupId, principal.userId)
        return ResponseEntity.ok(assetSources.map(AssetSourceResponse::from))
    }

    @GetMapping("/{assetSourceId}")
    fun getAssetSource(
        @PathVariable groupId: Long,
        @PathVariable assetSourceId: Long,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<AssetSourceResponse> {
        val assetSource = assetSourceService.findById(assetSourceId, principal.userId)
        return ResponseEntity.ok(AssetSourceResponse.from(assetSource))
    }

    @PutMapping("/{assetSourceId}")
    fun updateAssetSource(
        @PathVariable groupId: Long,
        @PathVariable assetSourceId: Long,
        @Valid @RequestBody request: UpdateAssetSourceRequest,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<AssetSourceResponse> {
        val assetSource = assetSourceService.update(
            assetSourceId = assetSourceId,
            userId = principal.userId,
            name = request.name,
            description = request.description,
        )

        return ResponseEntity.ok(AssetSourceResponse.from(assetSource))
    }

    @DeleteMapping("/{assetSourceId}")
    fun deleteAssetSource(
        @PathVariable groupId: Long,
        @PathVariable assetSourceId: Long,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<Void> {
        assetSourceService.delete(assetSourceId, principal.userId)
        return ResponseEntity.noContent().build()
    }
}
