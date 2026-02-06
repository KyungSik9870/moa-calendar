package com.moa.core.domain.user

import com.moa.core.domain.BaseEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table

@Entity
@Table(name = "users")
class User(

    @Column(nullable = false, unique = true)
    val email: String,

    @Column(nullable = false)
    val password: String,

    @Column(nullable = false, length = 10)
    val nickname: String,

    @Column(name = "color_code", nullable = false, length = 7)
    val colorCode: String,

    @Column(name = "personal_asset_color", length = 7)
    val personalAssetColor: String = DEFAULT_PERSONAL_ASSET_COLOR,

    @Column(name = "profile_image_url")
    val profileImageUrl: String? = null,

) : BaseEntity() {

    companion object {
        const val DEFAULT_PERSONAL_ASSET_COLOR = "#E91E63"

        val AVAILABLE_COLORS = listOf(
            "#5B9FFF", // 파란색
            "#E91E63", // 분홍색
            "#FF9800", // 주황색
            "#4CAF50", // 초록색
            "#9C27B0", // 보라색
            "#FFC107", // 노란색
            "#F44336", // 빨간색
            "#00BCD4", // 청록색
        )
    }

    init {
        require(email.contains("@")) { "유효하지 않은 이메일 형식입니다." }
        require(nickname.length in 2..10) { "닉네임은 2~10자여야 합니다." }
        require(colorCode in AVAILABLE_COLORS) { "유효하지 않은 색상 코드입니다: $colorCode" }
    }
}
