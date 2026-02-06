package com.moa.core.exception

sealed class BusinessException(
    val errorCode: ErrorCode,
    override val message: String = errorCode.message,
) : RuntimeException(message)

class DuplicateEmailException(email: String) :
    BusinessException(ErrorCode.DUPLICATE_EMAIL, "이미 사용 중인 이메일입니다: $email")

class InvalidCredentialsException :
    BusinessException(ErrorCode.INVALID_CREDENTIALS)

class UserNotFoundException(identifier: String) :
    BusinessException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다: $identifier")

class GroupNotFoundException(groupId: Long) :
    BusinessException(ErrorCode.GROUP_NOT_FOUND, "그룹을 찾을 수 없습니다: $groupId")

class GroupAccessDeniedException(groupId: Long) :
    BusinessException(ErrorCode.GROUP_ACCESS_DENIED, "해당 그룹에 대한 접근 권한이 없습니다: $groupId")

class ScheduleNotFoundException(scheduleId: Long) :
    BusinessException(ErrorCode.SCHEDULE_NOT_FOUND, "일정을 찾을 수 없습니다: $scheduleId")
