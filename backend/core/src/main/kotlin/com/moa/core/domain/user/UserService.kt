package com.moa.core.domain.user

import com.moa.core.exception.DuplicateEmailException
import com.moa.core.exception.InvalidCredentialsException
import com.moa.core.exception.UserNotFoundException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
) {

    @Transactional
    fun signUp(
        email: String,
        rawPassword: String,
        nickname: String,
        colorCode: String,
        profileImageUrl: String? = null,
    ): User {
        if (userRepository.existsByEmail(email)) {
            throw DuplicateEmailException(email)
        }

        val user = User(
            email = email,
            password = passwordEncoder.encode(rawPassword),
            nickname = nickname,
            colorCode = colorCode,
            profileImageUrl = profileImageUrl,
        )

        return userRepository.save(user)
    }

    fun authenticate(email: String, rawPassword: String): User {
        val user = userRepository.findByEmail(email)
            ?: throw InvalidCredentialsException()

        if (!passwordEncoder.matches(rawPassword, user.password)) {
            throw InvalidCredentialsException()
        }

        return user
    }

    fun findById(id: Long): User =
        userRepository.findById(id).orElseThrow { UserNotFoundException(id.toString()) }

    fun findByEmail(email: String): User =
        userRepository.findByEmail(email) ?: throw UserNotFoundException(email)

    fun searchByEmail(email: String): User? =
        userRepository.findByEmail(email)

    @Transactional
    fun updateProfile(
        userId: Long,
        nickname: String?,
        colorCode: String?,
        personalAssetColor: String?,
        profileImageUrl: String?,
    ): User {
        val user = findById(userId)
        user.updateProfile(nickname, colorCode, personalAssetColor, profileImageUrl)
        return user
    }
}
