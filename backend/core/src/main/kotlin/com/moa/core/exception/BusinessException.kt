package com.moa.core.exception

sealed class BusinessException(
    val errorCode: ErrorCode,
    override val message: String = errorCode.message,
) : RuntimeException(message)

// Auth
class DuplicateEmailException(email: String) :
    BusinessException(ErrorCode.DUPLICATE_EMAIL, "이미 사용 중인 이메일입니다: $email")

class InvalidCredentialsException :
    BusinessException(ErrorCode.INVALID_CREDENTIALS)

// User
class UserNotFoundException(identifier: String) :
    BusinessException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다: $identifier")

// Group
class GroupNotFoundException(groupId: Long) :
    BusinessException(ErrorCode.GROUP_NOT_FOUND, "그룹을 찾을 수 없습니다: $groupId")

class GroupAccessDeniedException(groupId: Long) :
    BusinessException(ErrorCode.GROUP_ACCESS_DENIED, "해당 그룹에 대한 접근 권한이 없습니다: $groupId")

class GroupFullException(groupId: Long) :
    BusinessException(ErrorCode.GROUP_FULL, "그룹 최대 인원(${com.moa.core.domain.group.Group.MAX_MEMBERS}명)을 초과했습니다: $groupId")

class NotGroupHostException(groupId: Long) :
    BusinessException(ErrorCode.NOT_GROUP_HOST, "그룹 호스트만 수행할 수 있는 작업입니다: $groupId")

class CannotLeaveAsHostException(groupId: Long) :
    BusinessException(ErrorCode.CANNOT_LEAVE_AS_HOST, "호스트는 그룹을 탈퇴할 수 없습니다: $groupId")

class CannotDeletePersonalGroupException :
    BusinessException(ErrorCode.CANNOT_DELETE_PERSONAL_GROUP)

// Schedule
class ScheduleNotFoundException(scheduleId: Long) :
    BusinessException(ErrorCode.SCHEDULE_NOT_FOUND, "일정을 찾을 수 없습니다: $scheduleId")

// Invite
class InviteNotFoundException(inviteId: Long) :
    BusinessException(ErrorCode.INVITE_NOT_FOUND, "초대를 찾을 수 없습니다: $inviteId")

class InviteAlreadyExistsException(email: String) :
    BusinessException(ErrorCode.INVITE_ALREADY_EXISTS, "이미 초대된 사용자입니다: $email")

class SelfInviteException :
    BusinessException(ErrorCode.SELF_INVITE)

class AlreadyGroupMemberException(email: String) :
    BusinessException(ErrorCode.ALREADY_GROUP_MEMBER, "이미 그룹 멤버입니다: $email")

// Transaction
class TransactionNotFoundException(transactionId: Long) :
    BusinessException(ErrorCode.TRANSACTION_NOT_FOUND, "거래를 찾을 수 없습니다: $transactionId")

// Category
class CategoryNotFoundException(categoryId: Long) :
    BusinessException(ErrorCode.CATEGORY_NOT_FOUND, "카테고리를 찾을 수 없습니다: $categoryId")

class DefaultCategoryUndeletableException :
    BusinessException(ErrorCode.DEFAULT_CATEGORY_UNDELETABLE)

// Asset Source
class AssetSourceNotFoundException(assetSourceId: Long) :
    BusinessException(ErrorCode.ASSET_SOURCE_NOT_FOUND, "자산을 찾을 수 없습니다: $assetSourceId")

class AssetSourceInUseException(assetSourceId: Long) :
    BusinessException(ErrorCode.ASSET_SOURCE_IN_USE, "사용 중인 자산은 삭제할 수 없습니다: $assetSourceId")
