package com.moa.core.domain.invite

import com.moa.core.domain.BaseEntity
import com.moa.core.domain.group.Group
import com.moa.core.domain.user.User
import jakarta.persistence.*

@Entity
@Table(
    name = "invites",
    uniqueConstraints = [UniqueConstraint(columnNames = ["group_id", "invitee_id"])],
)
class Invite(

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    val group: Group,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inviter_id", nullable = false)
    val inviter: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invitee_id", nullable = false)
    val invitee: User,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    var status: InviteStatus = InviteStatus.PENDING,

) : BaseEntity() {

    fun accept() {
        status = InviteStatus.ACCEPTED
    }

    fun reject() {
        status = InviteStatus.REJECTED
    }
}
