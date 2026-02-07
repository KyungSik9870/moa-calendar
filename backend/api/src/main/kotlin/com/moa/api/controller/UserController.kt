package com.moa.api.controller

import com.moa.api.dto.request.UpdateProfileRequest
import com.moa.api.dto.response.UserResponse
import com.moa.api.security.UserPrincipal
import com.moa.core.domain.user.UserService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/users")
class UserController(
    private val userService: UserService,
) {

    @GetMapping("/me")
    fun getMyProfile(
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<UserResponse> {
        val user = userService.findById(principal.userId)
        return ResponseEntity.ok(UserResponse.from(user))
    }

    @PutMapping("/me")
    fun updateMyProfile(
        @Valid @RequestBody request: UpdateProfileRequest,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<UserResponse> {
        val user = userService.updateProfile(
            userId = principal.userId,
            nickname = request.nickname,
            colorCode = request.colorCode,
            personalAssetColor = request.personalAssetColor,
            profileImageUrl = request.profileImageUrl,
        )
        return ResponseEntity.ok(UserResponse.from(user))
    }

    @GetMapping("/search")
    fun searchUser(
        @RequestParam email: String,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<UserResponse?> {
        val user = userService.searchByEmail(email)
        return if (user != null) {
            ResponseEntity.ok(UserResponse.from(user))
        } else {
            ResponseEntity.noContent().build()
        }
    }
}
