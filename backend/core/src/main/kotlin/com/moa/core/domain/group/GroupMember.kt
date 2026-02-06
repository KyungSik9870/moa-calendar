package com.moa.core.domain.group

import com.moa.core.domain.BaseEntity
import com.moa.core.domain.user.User
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import java.time.LocalDateTime

@Entity
@Table(
    name = "group_members",
    uniqueConstraints = [UniqueConstraint(columnNames = ["group_id", "user_id"])],
)
class GroupMember(

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    val group: Group,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    val role: GroupRole,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    var status: GroupMemberStatus = GroupMemberStatus.INVITED,

    @Column(name = "joined_at")
    var joinedAt: LocalDateTime? = null,

) : BaseEntity() {

    fun accept() {
        status = GroupMemberStatus.ACCEPTED
        joinedAt = LocalDateTime.now()
    }
}
