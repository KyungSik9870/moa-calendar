package com.moa.api.controller

import com.moa.api.dto.request.CreateGroupRequest
import com.moa.api.dto.request.InviteRequest
import com.moa.api.dto.request.UpdateGroupRequest
import com.moa.api.dto.response.GroupMemberResponse
import com.moa.api.dto.response.GroupResponse
import com.moa.api.dto.response.InviteResponse
import com.moa.api.security.UserPrincipal
import com.moa.core.domain.group.GroupService
import com.moa.core.domain.invite.InviteService
import com.moa.core.domain.user.UserService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/groups")
class GroupController(
    private val groupService: GroupService,
    private val inviteService: InviteService,
    private val userService: UserService,
) {

    @PostMapping
    fun createGroup(
        @Valid @RequestBody request: CreateGroupRequest,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<GroupResponse> {
        val user = userService.findById(principal.userId)

        val group = groupService.createSharedGroup(
            user = user,
            name = request.name,
            jointAssetColor = request.jointAssetColor,
            budgetStartDay = request.budgetStartDay,
        )

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(GroupResponse.from(group))
    }

    @GetMapping
    fun getGroups(
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<List<GroupResponse>> {
        val groups = groupService.findByUserId(principal.userId)
        return ResponseEntity.ok(groups.map(GroupResponse::from))
    }

    @GetMapping("/{groupId}")
    fun getGroup(
        @PathVariable groupId: Long,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<GroupResponse> {
        val group = groupService.findById(groupId)
        return ResponseEntity.ok(GroupResponse.from(group))
    }

    @PutMapping("/{groupId}")
    fun updateGroup(
        @PathVariable groupId: Long,
        @Valid @RequestBody request: UpdateGroupRequest,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<GroupResponse> {
        val group = groupService.updateGroup(
            groupId = groupId,
            userId = principal.userId,
            name = request.name,
            jointAssetColor = request.jointAssetColor,
            budgetStartDay = request.budgetStartDay,
        )

        return ResponseEntity.ok(GroupResponse.from(group))
    }

    @DeleteMapping("/{groupId}")
    fun deleteGroup(
        @PathVariable groupId: Long,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<Void> {
        groupService.deleteGroup(groupId, principal.userId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{groupId}/members")
    fun getMembers(
        @PathVariable groupId: Long,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<List<GroupMemberResponse>> {
        val members = groupService.getMembers(groupId, principal.userId)
        return ResponseEntity.ok(members.map(GroupMemberResponse::from))
    }

    @DeleteMapping("/{groupId}/members/{targetUserId}")
    fun removeMember(
        @PathVariable groupId: Long,
        @PathVariable targetUserId: Long,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<Void> {
        groupService.removeMember(groupId, principal.userId, targetUserId)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/{groupId}/members/self")
    fun leaveGroup(
        @PathVariable groupId: Long,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<Void> {
        groupService.leaveGroup(groupId, principal.userId)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{groupId}/invites")
    fun inviteMember(
        @PathVariable groupId: Long,
        @Valid @RequestBody request: InviteRequest,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<InviteResponse> {
        val user = userService.findById(principal.userId)

        val invite = inviteService.invite(
            groupId = groupId,
            inviter = user,
            inviteeEmail = request.email,
        )

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(InviteResponse.from(invite))
    }

    @GetMapping("/invites/pending")
    fun getPendingInvites(
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<List<InviteResponse>> {
        val invites = inviteService.findPendingByUserId(principal.userId)
        return ResponseEntity.ok(invites.map(InviteResponse::from))
    }

    @PostMapping("/invites/{inviteId}/accept")
    fun acceptInvite(
        @PathVariable inviteId: Long,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<GroupMemberResponse> {
        val member = inviteService.accept(inviteId, principal.userId)
        return ResponseEntity.ok(GroupMemberResponse.from(member))
    }

    @PostMapping("/invites/{inviteId}/reject")
    fun rejectInvite(
        @PathVariable inviteId: Long,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<Void> {
        inviteService.reject(inviteId, principal.userId)
        return ResponseEntity.noContent().build()
    }
}
