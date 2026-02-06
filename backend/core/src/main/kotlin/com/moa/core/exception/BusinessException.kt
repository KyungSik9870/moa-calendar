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
