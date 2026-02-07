package com.moa.core.exception

import org.springframework.http.HttpStatus

enum class ErrorCode(
    val status: HttpStatus,
    val message: String,
) {
    // Auth
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "만료된 토큰입니다."),

    // User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),

    // Group
    GROUP_NOT_FOUND(HttpStatus.NOT_FOUND, "그룹을 찾을 수 없습니다."),
    GROUP_ACCESS_DENIED(HttpStatus.FORBIDDEN, "해당 그룹에 대한 접근 권한이 없습니다."),
    GROUP_FULL(HttpStatus.BAD_REQUEST, "그룹 최대 인원을 초과했습니다."),
    NOT_GROUP_HOST(HttpStatus.FORBIDDEN, "그룹 호스트만 수행할 수 있는 작업입니다."),
    CANNOT_LEAVE_AS_HOST(HttpStatus.BAD_REQUEST, "호스트는 그룹을 탈퇴할 수 없습니다. 그룹을 삭제해주세요."),
    CANNOT_DELETE_PERSONAL_GROUP(HttpStatus.BAD_REQUEST, "개인 캘린더는 삭제할 수 없습니다."),

    // Schedule
    SCHEDULE_NOT_FOUND(HttpStatus.NOT_FOUND, "일정을 찾을 수 없습니다."),

    // Invite
    INVITE_NOT_FOUND(HttpStatus.NOT_FOUND, "초대를 찾을 수 없습니다."),
    INVITE_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 초대된 사용자입니다."),
    SELF_INVITE(HttpStatus.BAD_REQUEST, "자기 자신을 초대할 수 없습니다."),
    ALREADY_GROUP_MEMBER(HttpStatus.CONFLICT, "이미 그룹 멤버입니다."),

    // Transaction
    TRANSACTION_NOT_FOUND(HttpStatus.NOT_FOUND, "거래를 찾을 수 없습니다."),

    // Category
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다."),
    DEFAULT_CATEGORY_UNDELETABLE(HttpStatus.BAD_REQUEST, "기본 카테고리는 삭제할 수 없습니다."),

    // Asset Source
    ASSET_SOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "자산을 찾을 수 없습니다."),
    ASSET_SOURCE_IN_USE(HttpStatus.BAD_REQUEST, "사용 중인 자산은 삭제할 수 없습니다."),

    // Common
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "잘못된 입력입니다."),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."),
}
