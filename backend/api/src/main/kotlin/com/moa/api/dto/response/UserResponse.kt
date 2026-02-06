package com.moa.api.dto.response

import com.moa.core.domain.user.User
import java.time.LocalDateTime

data class UserResponse(
    val id: Long,
    val email: String,
    val nickname: String,
    val colorCode: String,
    val personalAssetColor: String,
    val profileImageUrl: String?,
    val createdAt: LocalDateTime,
) {
    companion object {
        fun from(user: User): UserResponse = UserResponse(
            id = user.id,
            email = user.email,
            nickname = user.nickname,
            colorCode = user.colorCode,
            personalAssetColor = user.personalAssetColor,
            profileImageUrl = user.profileImageUrl,
            createdAt = user.createdAt,
        )
    }
}
