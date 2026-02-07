package com.moa.api.controller

import com.moa.api.dto.request.CreateCategoryRequest
import com.moa.api.dto.request.UpdateCategoryRequest
import com.moa.api.dto.response.CategoryResponse
import com.moa.api.security.UserPrincipal
import com.moa.core.domain.category.CategoryService
import com.moa.core.domain.category.CategoryType
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/groups/{groupId}/categories")
class CategoryController(
    private val categoryService: CategoryService,
) {

    @PostMapping
    fun createCategory(
        @PathVariable groupId: Long,
        @Valid @RequestBody request: CreateCategoryRequest,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<CategoryResponse> {
        val category = categoryService.create(
            groupId = groupId,
            userId = principal.userId,
            name = request.name,
            icon = request.icon,
            type = request.type,
        )

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(CategoryResponse.from(category))
    }

    @GetMapping
    fun getCategories(
        @PathVariable groupId: Long,
        @RequestParam(required = false) type: CategoryType?,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<List<CategoryResponse>> {
        val categories = categoryService.findByGroupId(groupId, principal.userId, type)
        return ResponseEntity.ok(categories.map(CategoryResponse::from))
    }

    @PutMapping("/{categoryId}")
    fun updateCategory(
        @PathVariable groupId: Long,
        @PathVariable categoryId: Long,
        @Valid @RequestBody request: UpdateCategoryRequest,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<CategoryResponse> {
        val category = categoryService.update(
            categoryId = categoryId,
            userId = principal.userId,
            name = request.name,
            icon = request.icon,
        )

        return ResponseEntity.ok(CategoryResponse.from(category))
    }

    @DeleteMapping("/{categoryId}")
    fun deleteCategory(
        @PathVariable groupId: Long,
        @PathVariable categoryId: Long,
        @AuthenticationPrincipal principal: UserPrincipal,
    ): ResponseEntity<Void> {
        categoryService.delete(categoryId, principal.userId)
        return ResponseEntity.noContent().build()
    }
}
