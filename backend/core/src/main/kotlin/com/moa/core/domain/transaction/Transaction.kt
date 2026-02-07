package com.moa.core.domain.transaction

import com.moa.core.domain.AssetType
import com.moa.core.domain.BaseEntity
import com.moa.core.domain.assetsource.AssetSource
import com.moa.core.domain.group.Group
import com.moa.core.domain.schedule.Schedule
import com.moa.core.domain.user.User
import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate

@Entity
@Table(
    name = "transactions",
    indexes = [Index(name = "idx_transaction_group_date", columnList = "group_id, date")],
)
class Transaction(

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    val group: Group,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @Column(nullable = false, precision = 15, scale = 2)
    var amount: BigDecimal,

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 10)
    var transactionType: TransactionType,

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_type", nullable = false, length = 10)
    var assetType: AssetType = AssetType.PERSONAL,

    @Column(nullable = false, length = 30)
    var categoryName: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_source_id")
    var assetSource: AssetSource? = null,

    @Column(nullable = false)
    var date: LocalDate,

    @Column(length = 200)
    var description: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id")
    var schedule: Schedule? = null,

) : BaseEntity() {

    init {
        require(amount > BigDecimal.ZERO) { "금액은 0보다 커야 합니다." }
        require(categoryName.isNotBlank()) { "카테고리는 필수입니다." }
    }

    fun update(
        amount: BigDecimal,
        transactionType: TransactionType,
        assetType: AssetType,
        categoryName: String,
        assetSource: AssetSource?,
        date: LocalDate,
        description: String?,
        schedule: Schedule?,
    ) {
        require(amount > BigDecimal.ZERO) { "금액은 0보다 커야 합니다." }
        require(categoryName.isNotBlank()) { "카테고리는 필수입니다." }
        this.amount = amount
        this.transactionType = transactionType
        this.assetType = assetType
        this.categoryName = categoryName
        this.assetSource = assetSource
        this.date = date
        this.description = description
        this.schedule = schedule
    }
}
