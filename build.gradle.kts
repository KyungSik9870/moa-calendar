plugins {
	kotlin("jvm") version "1.9.22" apply false
	kotlin("plugin.spring") version "1.9.22" apply false
	id("org.springframework.boot") version "3.4.2" apply false
	id("io.spring.dependency-management") version "1.1.7" apply false
	kotlin("plugin.jpa") version "1.9.22" apply false
}

allprojects {
	group = "com.moa"
	version = "0.0.1-SNAPSHOT"

	repositories {
		mavenCentral()
	}
}

subprojects {
	apply(plugin = "org.jetbrains.kotlin.jvm")
	apply(plugin = "org.jetbrains.kotlin.plugin.spring")
	apply(plugin = "io.spring.dependency-management")

	tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
		kotlinOptions {
			jvmTarget = "21"
			freeCompilerArgs = listOf("-Xjsr305=strict")
		}
	}

	configure<JavaPluginExtension> {
		toolchain {
			languageVersion.set(JavaLanguageVersion.of(21))
		}
	}

	dependencies {
		"implementation"("org.jetbrains.kotlin:kotlin-reflect")
		"implementation"("com.fasterxml.jackson.module:jackson-module-kotlin")
		"testImplementation"("org.jetbrains.kotlin:kotlin-test-junit5")
		"testRuntimeOnly"("org.junit.platform:junit-platform-launcher")
	}

	tasks.withType<Test> {
		useJUnitPlatform()
	}
}