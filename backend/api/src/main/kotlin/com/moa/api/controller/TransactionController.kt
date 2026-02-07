package com.moa.api.controller

import com.moa.api.dto.request.CreateTransactionRequest
import com.moa.api.dto.request.UpdateTransactionRequest
import com.moa.api.dto.response.TransactionResponse
import com.moa.api.dto.response.TransactionSummaryResponse
import com.moa.api.security.UserPrincipal
import com.moa.core.domain.AssetType
import com.moa.core.domain.transaction.TransactionService
import com.moa.core.domain.user.UserService
import jakarta.validation.Valid
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
@RequestMapping("/api/v1/groups/{groupId}/transactions")
class TransactionController(
    private val transactionService: TransactionService,
    private val userService: UserService,
) {

    @PostMapping
    fun createTransaction(
        @PathVariable groupId: Long,
        @Valid @RequestBody request: CreateTransactionRequest,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<TransactionResponse> {
        val user = userService.findById(principal.userId)

        val transaction = transactionService.create(
            groupId = groupId,
            user = user,
            amount = request.amount,
            transactionType = request.transactionType,
            assetType = request.assetType,
            categoryName = request.categoryName,
            assetSourceId = request.assetSourceId,
            date = request.date,
            description = request.description,
            scheduleId = request.scheduleId,
        )

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(TransactionResponse.from(transaction))
    }

    @GetMapping
    fun getTransactions(
        @PathVariable groupId: Long,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate,
        @RequestParam(required = false) assetType: AssetType?,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<List<TransactionResponse>> {
        val transactions = transactionService.findByDateRange(groupId, principal.userId, startDate, endDate, assetType)
        return ResponseEntity.ok(transactions.map(TransactionResponse::from))
    }

    @GetMapping("/{transactionId}")
    fun getTransaction(
        @PathVariable groupId: Long,
        @PathVariable transactionId: Long,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<TransactionResponse> {
        val transaction = transactionService.findById(transactionId, principal.userId)
        return ResponseEntity.ok(TransactionResponse.from(transaction))
    }

    @PutMapping("/{transactionId}")
    fun updateTransaction(
        @PathVariable groupId: Long,
        @PathVariable transactionId: Long,
        @Valid @RequestBody request: UpdateTransactionRequest,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<TransactionResponse> {
        val transaction = transactionService.update(
            transactionId = transactionId,
            userId = principal.userId,
            amount = request.amount,
            transactionType = request.transactionType,
            assetType = request.assetType,
            categoryName = request.categoryName,
            assetSourceId = request.assetSourceId,
            date = request.date,
            description = request.description,
            scheduleId = request.scheduleId,
        )

        return ResponseEntity.ok(TransactionResponse.from(transaction))
    }

    @DeleteMapping("/{transactionId}")
    fun deleteTransaction(
        @PathVariable groupId: Long,
        @PathVariable transactionId: Long,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<Void> {
        transactionService.delete(transactionId, principal.userId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/summary")
    fun getTransactionSummary(
        @PathVariable groupId: Long,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<TransactionSummaryResponse> {
        val summary = transactionService.getSummary(groupId, principal.userId, startDate, endDate)
        return ResponseEntity.ok(TransactionSummaryResponse.from(summary))
    }
}
