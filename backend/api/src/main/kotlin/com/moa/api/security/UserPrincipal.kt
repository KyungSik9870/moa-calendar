package com.moa.api.security

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.User as SpringUser

class UserPrincipal(
    val userId: Long,
    email: String,
    password: String,
    authorities: Collection<GrantedAuthority>,
) : SpringUser(email, password, authorities)
