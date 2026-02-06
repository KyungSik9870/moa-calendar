package com.moa.api

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@SpringBootApplication(scanBasePackages = ["com.moa"])
@EntityScan(basePackages = ["com.moa.core.domain"])
@EnableJpaRepositories(basePackages = ["com.moa.core.domain"])
class MoaCalendarApplication

fun main(args: Array<String>) {
    runApplication<MoaCalendarApplication>(*args)
}
